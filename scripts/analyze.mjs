#!/usr/bin/env node

/**
 * Codebase Analyzer
 * ==================
 *
 * Parses all .ts/.tsx/.js/.jsx files under src/ and produces two artifacts:
 *
 * 1. public/graph/graph.json
 *    Queryable graph data for the React CodebaseGraph page, the PRImpact
 *    dashboard, and the standalone /graph.html page.
 *    Schema:
 *    {
 *      nodes: [{ id, name, type, relPath, exports, externalDeps, componentsUsed,
 *                hooksUsed, lines, docstrings, x, y }],
 *      links: [{ source, target, type }],
 *      meta:  { analyzedAt, fileCount }
 *    }
 *    - `type` is one of: page, component, gamification-component, chat-component,
 *      chat-widget, context, api-module, hook, utility, type-definition, stylesheet, module
 *    - `links.type` is one of: imports, uses-hook, uses-component
 *
 * 2. public/graph/REPORT.md
 *    Full Markdown report listing every file, its type, exports, dependencies,
 *    and relationship counts.
 *
 * The standalone visualization is built by Vite (graph.html + src/graph/main.ts)
 * and imports d3 from npm; this script only emits data and the report.
 *
 * Usage:
 *   node scripts/analyze.mjs
 *
 * Dependencies: None (pure Node.js).
 */

import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from 'fs';
import { join, relative, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'public', 'graph');

mkdirSync(OUT, { recursive: true });

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.git', '__tests__', '__mocks__']);

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...walk(full));
    } else if (EXTENSIONS.has(extname(entry))) {
      results.push(full);
    }
  }
  return results;
}

function classifyFile(relPath, content) {
  const parts = relPath.split('/');
  const dir1 = parts[0] || '';
  const dir2 = parts[1] || '';
  const name = basename(relPath, extname(relPath));

  if (dir1 === 'pages') return 'page';
  if (dir1 === 'components' && dir2 === 'gamification') return 'gamification-component';
  if (dir1 === 'components' && dir2 === 'chat') return 'chat-component';
  if (dir1 === 'components' && dir2 === 'ChatWidget') return 'chat-widget';
  if (dir1 === 'components') return 'component';
  if (dir1 === 'contexts') return 'context';
  if (dir1 === 'api') return 'api-module';
  if (dir1 === 'hooks') return 'hook';
  if (dir1 === 'utils') return 'utility';
  if (dir1 === 'types') return 'type-definition';
  if (dir1 === 'styles') return 'stylesheet';

  if (name.endsWith('Provider')) return 'context';
  if (name.startsWith('use')) return 'hook';
  if (content.includes('export default function') || content.includes('export const') && content.includes('React.FC')) return 'component';
  if (content.includes('export default')) return 'module';

  return 'module';
}

function extractImports(content) {
  const imports = [];
  const importRegex = /(?:import|from)\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const spec = match[1];
    if (spec.startsWith('.')) {
      imports.push(spec);
    }
  }
  return imports;
}


function extractDependencies(content) {
  const deps = new Set();
  const packages = content.match(/from\s+['"](@?[a-z][a-z0-9.-]*[a-z0-9](?:\/[a-z][a-z0-9.-]*)?)/g) || [];
  for (const p of packages) {
    const name = p.replace(/from\s+['"]/, '');
    if (!name.startsWith('.')) deps.add(name);
  }
  return [...deps];
}

function extractComponentUsage(content) {
  const usages = [];
  const componentRegex = /<([A-Z][A-Za-z0-9]+)/g;
  let match;
  while ((match = componentRegex.exec(content)) !== null) {
    usages.push(match[1]);
  }
  return [...new Set(usages)];
}

function extractHookUsage(content) {
  const hooks = [];
  const hookRegex = /\b(use[A-Z][A-Za-z0-9]+)\s*\(/g;
  let match;
  while ((match = hookRegex.exec(content)) !== null) {
    hooks.push(match[1]);
  }
  return [...new Set(hooks)];
}

function extractExportsList(content) {
  const list = [];
  const re = /export\s+(?:default\s+)?(?:function|const|class|interface|type|enum)\s+(\w+)/g;
  let m;
  while ((m = re.exec(content)) !== null) list.push(m[1]);
  if (content.includes('export default')) list.push('default');
  return list;
}

function extractDocstrings(content) {
  const docstrings = [];
  const docRegex = /\/\*\*\s*([\s\S]*?)\s*\*\//g;
  let m;
  while ((m = docRegex.exec(content)) !== null) {
    docstrings.push(m[1].replace(/^\s*\*\s?/gm, '').trim());
  }
  const lineDocRegex = /\/\/\s*(.{20,})/g;
  while ((m = lineDocRegex.exec(content)) !== null) {
    docstrings.push(m[1].trim());
  }
  return docstrings.slice(0, 3);
}



const allFiles = walk(SRC);
console.log(`Found ${allFiles.length} files to analyze...`);

const files = allFiles;
const nodes = [];
const links = [];
const fileMap = {};
const nameToId = {};
const pathToId = {};

for (const file of files) {
  const relPath = relative(SRC, file).replace(/\\/g, '/');
  const content = readFileSync(file, 'utf-8');
  const type = classifyFile(relPath, content);
  const id = relPath;
  const name = basename(relPath, extname(relPath));
  const imports = extractImports(content);
  const exportsList = extractExportsList(content);
  const deps = extractDependencies(content);
  const components = extractComponentUsage(content);
  const hooks = extractHookUsage(content);
  const docstrings = extractDocstrings(content);
  const lines = content.split('\n').length;

  fileMap[id] = { imports, components, hooks };
  nameToId[name] = id;
  pathToId[relPath] = id;

  nodes.push({
    id,
    name,
    type,
    relPath,
    exports: exportsList,
    externalDeps: deps,
    componentsUsed: components,
    hooksUsed: hooks,
    lines,
    docstrings,
  });
}

for (const node of nodes) {
  const data = fileMap[node.id];
  for (const imp of data.imports) {
    const fromDir = dirname(node.id);
    let resolved = (fromDir === '.' ? imp : (fromDir + '/' + imp)).replace(/\\/g, '/');
    const parts = resolved.split('/');
    const normalized = [];
    for (const p of parts) {
      if (p === '.') continue;
      if (p === '..') { normalized.pop(); continue; }
      normalized.push(p);
    }
    resolved = normalized.join('/');
    const candidates = [
      resolved,
      resolved + '.ts', resolved + '.tsx', resolved + '.js', resolved + '.jsx',
      resolved + '/index.ts', resolved + '/index.tsx', resolved + '/index.js',
    ];
    let found = false;
    for (const c of candidates) {
      if (pathToId[c]) {
        links.push({ source: node.id, target: pathToId[c], type: 'imports' });
        found = true;
        break;
      }
    }
    if (!found) {
      links.push({ source: node.id, target: resolved, type: 'imports-external' });
    }
  }
}

const deduped = [];
const seen = new Set();
for (const link of links) {
  const key = `${link.source}|${link.target}|${link.type}`;
  if (!seen.has(key)) {
    seen.add(key);
    deduped.push(link);
  }
}

const nodeIds = new Set(nodes.map(n => n.id));
const resolvableLinks = deduped.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

const graphData = { nodes, links: resolvableLinks, meta: { analyzedAt: new Date().toISOString(), fileCount: allFiles.length } };

writeFileSync(join(OUT, 'graph.json'), JSON.stringify(graphData, null, 2));
console.log(`Graph: ${nodes.length} nodes, ${resolvableLinks.length} links (${deduped.length - resolvableLinks.length} unresolvable dropped)`);

function generateMarkdown(data) {
  const stats = {};
  data.nodes.forEach(n => { stats[n.type] = (stats[n.type] || 0) + 1; });

  const typeCounts = Object.entries(stats).sort((a, b) => b[1] - a[1]);

  const hubs = data.nodes
    .map(n => ({
      ...n,
      connections: data.links.filter(l => l.source.id === n.id || l.target.id === n.id || l.source === n.id || l.target === n.id).length
    }))
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 15);

  const linkTypes = {};
  data.links.forEach(l => { linkTypes[l.type] = (linkTypes[l.type] || 0) + 1; });

  const externalDeps = {};
  data.nodes.forEach(n => (n.externalDeps || []).forEach(d => {
    externalDeps[d] = (externalDeps[d] || 0) + 1;
  }));
  const topDeps = Object.entries(externalDeps).sort((a, b) => b[1] - a[1]).slice(0, 20);

  let md = `# Deepiri Codebase Intelligence Report

Generated: ${new Date().toLocaleString()}

## Overview

| Metric | Value |
|--------|-------|
| Total Files | ${data.nodes.length} |
| Total Relationships | ${data.links.length} |
| Categories | ${typeCounts.length} |
| External Dependencies | ${Object.keys(externalDeps).length} |

## File Distribution

| Category | Count |
|----------|-------|
${typeCounts.map(([t, c]) => `| ${t.replace(/-/g, ' ')} | ${c} |`).join('\n')}

## Relationship Types

| Type | Count |
|------|-------|
${Object.entries(linkTypes).map(([t, c]) => `| ${t} | ${c} |`).join('\n')}

## Top Hub Files (Most Connected)

| Rank | File | Category | Lines | Connections |
|------|------|----------|-------|-------------|
${hubs.map((h, i) => `| ${i + 1} | ${h.name} | ${h.type} | ${h.lines} | ${h.connections} |`).join('\n')}

## External Dependencies

| Package | Used By |
|---------|---------|
${topDeps.map(([d, c]) => `| ${d} | ${c} files |`).join('\n')}

## Key Connections

`;

  const clusters = {};
  data.nodes.forEach(n => {
    const cluster = n.type;
    if (!clusters[cluster]) clusters[cluster] = [];
    clusters[cluster].push(n);
  });

  for (const [type, members] of Object.entries(clusters)) {
    md += `### ${type.replace(/-/g, ' ')}\n\n`;
    for (const m of members.slice(0, 10)) {
      const connections = data.links.filter(l => (l.source.id || l.source) === m.id || (l.target.id || l.target) === m.id);
      const imports = connections.filter(l => l.type === 'imports').map(l => {
        const target = l.target.id || l.target;
        const targetNode = data.nodes.find(n => n.id === target);
        return targetNode ? targetNode.name : target.split('/').pop();
      });
      md += `- **${m.name}** — ${m.lines} lines`;
      if (imports.length) md += ` → imports: ${imports.slice(0, 5).join(', ')}`;
      md += '\n';
    }
    if (members.length > 10) md += `- ...and ${members.length - 10} more\n`;
    md += '\n';
  }

  return md;
}

console.log('Generating Markdown report...');
const markdown = generateMarkdown(graphData);
writeFileSync(join(OUT, 'REPORT.md'), markdown);
console.log('Report exported to public/graph/REPORT.md');

console.log('\n=== Analysis Complete ===');
console.log(`Files: ${graphData.nodes.length}`);
console.log(`Relationships: ${graphData.links.length}`);
console.log(`Outputs:`);
console.log(`  - public/graph/graph.json  (queryable graph data)`);
console.log(`  - public/graph/REPORT.md   (Markdown report)`);
