import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import registry from '../config/serviceRegistry.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../../');

const CODE_EXTS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.py',
  '.go',
  '.rs',
  '.java',
  '.rb',
]);

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '__pycache__',
  'vendor',
  '.venv',
  'venv',
  'target',
  '.turbo',
  'vizult-output',
]);

export type GraphNode = {
  id: string;
  label: string;
  path: string;
  community: string;
  communityId: number;
  lines: number;
  degree: number;
  kind: string;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  kind: 'import' | 'inferred';
};

export type Community = {
  id: number;
  name: string;
  count: number;
  color: string;
};

export type RepoGraph = {
  repoId: string;
  repoName: string;
  generatedAt: string;
  nodeCount: number;
  edgeCount: number;
  communities: Community[];
  nodes: GraphNode[];
  edges: GraphEdge[];
};

const COMMUNITY_PALETTE = [
  '#F472B6',
  '#FB923C',
  '#60A5FA',
  '#34D399',
  '#FBBF24',
  '#A78BFA',
  '#2DD4BF',
  '#F87171',
  '#818CF8',
  '#4ADE80',
  '#E879F9',
  '#38BDF8',
];

function resolveRepoPath(localPath: string): string {
  return path.isAbsolute(localPath) ? localPath : path.resolve(REPO_ROOT, localPath);
}

function classifyKind(relPath: string): string {
  const lower = relPath.toLowerCase();
  if (lower.includes('/pages/') || lower.includes('/page/')) return 'page';
  if (lower.includes('/components/') || lower.includes('/component/')) return 'component';
  if (lower.includes('/hooks/')) return 'hook';
  if (lower.includes('/api/') || lower.includes('/routes/') || lower.includes('/services/'))
    return 'service';
  if (lower.includes('/store/') || lower.includes('/context')) return 'state';
  if (lower.includes('/utils/') || lower.includes('/lib/') || lower.includes('/helpers/'))
    return 'util';
  if (lower.includes('/types/') || lower.endsWith('.d.ts')) return 'type';
  if (lower.includes('/test') || lower.includes('__tests__') || lower.includes('.spec.'))
    return 'test';
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.go')) return 'go';
  if (lower.endsWith('.rb')) return 'ruby';
  return 'module';
}

function communityFromPath(relPath: string): string {
  const parts = relPath.split(/[/\\]/).filter(Boolean);
  if (parts[0] === 'packages' && parts[1]) return `packages/${parts[1]}`;
  if (parts[0] === 'src' && parts[1]) return `src/${parts[1]}`;
  if (parts[0] === 'platform-services' && parts[1] && parts[2]) {
    return `${parts[1]}/${parts[2]}`;
  }
  if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  return parts[0] ?? 'root';
}

function walkFiles(root: string, relBase = ''): string[] {
  const out: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.env.example') {
      if (entry.isDirectory()) continue;
    }
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...walkFiles(path.join(root, entry.name), path.join(relBase, entry.name)));
      continue;
    }
    const ext = path.extname(entry.name);
    if (!CODE_EXTS.has(ext)) continue;
    out.push(path.join(relBase, entry.name));
  }
  return out;
}

function extractImports(source: string, filePath: string): string[] {
  const imports: string[] = [];
  const patterns = [
    /import\s+(?:type\s+)?(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g,
    /require\(\s*['"]([^'"]+)['"]\s*\)/g,
    /import\(\s*['"]([^'"]+)['"]\s*\)/g,
    /from\s+([.\w/]+)\s+import\s+/g,
    /import\s+([.\w/]+)\s*$/gm,
    /require(?:_relative)?\s+['"]([^'"]+)['"]/g,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(source))) {
      imports.push(m[1]);
    }
  }
  // Go-ish
  if (filePath.endsWith('.go')) {
    const goRe = /"([^"]+)"/g;
    let m: RegExpExecArray | null;
    const block = source.match(/import\s*\(([\s\S]*?)\)/);
    if (block) {
      while ((m = goRe.exec(block[1]))) imports.push(m[1]);
    }
  }
  return imports;
}

function resolveImport(
  fromRel: string,
  spec: string,
  fileIndex: Map<string, string>
): string | null {
  const fromDir = path.posix.dirname(fromRel.replace(/\\/g, '/'));
  const tries: string[] = [];

  if (spec.startsWith('.') || spec.startsWith('/')) {
    const candidate = path.posix.normalize(path.posix.join(fromDir, spec));
    tries.push(
      candidate,
      `${candidate}.ts`,
      `${candidate}.tsx`,
      `${candidate}.js`,
      `${candidate}.jsx`,
      `${candidate}.mjs`,
      `${candidate}/index.ts`,
      `${candidate}/index.tsx`,
      `${candidate}/index.js`,
      `${candidate}.py`,
      `${candidate}.go`,
      `${candidate}.rb`
    );
  } else {
    // Non-relative: Ruby-style lib/foo or package path fragments
    tries.push(
      `lib/${spec}.rb`,
      `lib/${spec}.rb`.replace(/\.rb\.rb$/, '.rb'),
      `${spec}.rb`,
      `lib/${spec}/version.rb`
    );
  }

  for (const t of tries) {
    const hit = fileIndex.get(t);
    if (hit) return hit;
  }
  return null;
}

/**
 * Lightweight Louvain-inspired community refinement:
 * start from path communities, then merge tiny communities into their strongest neighbor.
 */
function refineCommunities(
  nodes: GraphNode[],
  edges: GraphEdge[],
  minSize = 3
): void {
  const byName = new Map<string, GraphNode[]>();
  for (const n of nodes) {
    const list = byName.get(n.community) ?? [];
    list.push(n);
    byName.set(n.community, list);
  }

  const adj = new Map<string, Map<string, number>>();
  for (const e of edges) {
    const a = adj.get(e.source) ?? new Map();
    a.set(e.target, (a.get(e.target) ?? 0) + 1);
    adj.set(e.source, a);
    const b = adj.get(e.target) ?? new Map();
    b.set(e.source, (b.get(e.source) ?? 0) + 1);
    adj.set(e.target, b);
  }

  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  for (const [name, members] of [...byName.entries()]) {
    if (members.length >= minSize) continue;
    // Find strongest external community
    const votes = new Map<string, number>();
    for (const m of members) {
      const neighbors = adj.get(m.id);
      if (!neighbors) continue;
      for (const [nid, w] of neighbors) {
        const other = nodeById.get(nid);
        if (!other || other.community === name) continue;
        votes.set(other.community, (votes.get(other.community) ?? 0) + w);
      }
    }
    let best: string | null = null;
    let bestW = 0;
    for (const [c, w] of votes) {
      if (w > bestW) {
        best = c;
        bestW = w;
      }
    }
    if (!best) continue;
    for (const m of members) m.community = best;
    byName.delete(name);
  }
}

export class GraphBuilder {
  private cache = new Map<string, { graph: RepoGraph; hash: string }>();

  listRepos(): typeof registry.repos {
    return registry.repos;
  }

  getCached(repoId: string): RepoGraph | null {
    return this.cache.get(repoId)?.graph ?? null;
  }

  build(repoId: string, force = false): RepoGraph {
    const repo = registry.repos.find((r) => r.id === repoId);
    if (!repo) {
      throw Object.assign(new Error(`Unknown repo: ${repoId}`), { statusCode: 404 });
    }

    const root = resolveRepoPath(repo.localPath);
    if (!fs.existsSync(root)) {
      throw Object.assign(new Error(`Repo path missing: ${root}`), { statusCode: 404 });
    }

    const stamp = this.quickStamp(root);
    const cached = this.cache.get(repoId);
    if (!force && cached && cached.hash === stamp) return cached.graph;

    const relFiles = walkFiles(root).slice(0, 2_500);
    const fileIndex = new Map<string, string>();
    for (const rel of relFiles) {
      const norm = rel.replace(/\\/g, '/');
      fileIndex.set(norm, norm);
      fileIndex.set(norm.replace(/\.(tsx?|jsx?|mjs|cjs)$/, ''), norm);
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const edgeKeys = new Set<string>();

    for (const rel of relFiles) {
      const abs = path.join(root, rel);
      let source = '';
      try {
        source = fs.readFileSync(abs, 'utf8');
      } catch {
        continue;
      }
      const norm = rel.replace(/\\/g, '/');
      const lines = source.split(/\r?\n/).length;
      nodes.push({
        id: norm,
        label: path.posix.basename(norm),
        path: norm,
        community: communityFromPath(norm),
        communityId: 0,
        lines,
        degree: 0,
        kind: classifyKind(norm),
      });

      for (const spec of extractImports(source, norm)) {
        const target = resolveImport(norm, spec, fileIndex);
        if (!target || target === norm) continue;
        const key = `${norm}->${target}`;
        if (edgeKeys.has(key)) continue;
        edgeKeys.add(key);
        edges.push({
          id: createHash('sha1').update(key).digest('hex').slice(0, 12),
          source: norm,
          target,
          kind: 'import',
        });
      }
    }

    refineCommunities(nodes, edges);

    const communityNames = [...new Set(nodes.map((n) => n.community))].sort();
    const communityIndex = new Map(communityNames.map((n, i) => [n, i]));
    for (const n of nodes) {
      n.communityId = communityIndex.get(n.community) ?? 0;
    }

    const degree = new Map<string, number>();
    for (const e of edges) {
      degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
      degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
    }
    for (const n of nodes) n.degree = degree.get(n.id) ?? 0;

    const communities: Community[] = communityNames.map((name, i) => ({
      id: i,
      name,
      count: nodes.filter((n) => n.community === name).length,
      color: COMMUNITY_PALETTE[i % COMMUNITY_PALETTE.length],
    }));

    const graph: RepoGraph = {
      repoId: repo.id,
      repoName: repo.name,
      generatedAt: new Date().toISOString(),
      nodeCount: nodes.length,
      edgeCount: edges.length,
      communities: communities.sort((a, b) => b.count - a.count),
      nodes,
      edges,
    };

    this.cache.set(repoId, { graph, hash: stamp });
    return graph;
  }

  private quickStamp(root: string): string {
    // Cheap invalidation: mtime of root + count of top-level entries
    try {
      const st = fs.statSync(root);
      const entries = fs.readdirSync(root).length;
      return `${st.mtimeMs}:${entries}`;
    } catch {
      return String(Date.now());
    }
  }
}
