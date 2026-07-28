import { describe, it, expect } from 'vitest';
import { buildUrl, cleanQuery } from '../utils/apiHelpers';

interface MockNode {
  id: string;
  name: string;
  type: string;
  relPath: string;
  exports: string[];
  lines: number;
}

interface MockLink {
  source: string;
  target: string;
  type: string;
}

function buildAdjacency(links: MockLink[]): Record<string, string[]> {
  const adj: Record<string, string[]> = {};
  for (const link of links) {
    if (!adj[link.source]) adj[link.source] = [];
    if (!adj[link.target]) adj[link.target] = [];
    adj[link.source].push(link.target);
    adj[link.target].push(link.source);
  }
  return adj;
}

function computeBlastRadius(
  selectedFiles: Set<string>,
  adjacency: Record<string, string[]>,
): Set<string> {
  const indirectlyAffected = new Set<string>();
  for (const fileId of selectedFiles) {
    const neighbors = adjacency[fileId] || [];
    const queue = [...neighbors];
    const visited = new Set<string>(neighbors);
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (!selectedFiles.has(current)) {
        indirectlyAffected.add(current);
      }
      for (const next of (adjacency[current] || [])) {
        if (!visited.has(next) && !selectedFiles.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
  }
  return indirectlyAffected;
}

function computeRiskScore(
  selectedFiles: Set<string>,
  adjacency: Record<string, string[]>,
  nodeMap: Record<string, MockNode>,
): { score: number; level: string } {
  let score = 0;
  for (const fileId of selectedFiles) {
    const neighbors = adjacency[fileId] || [];
    score += neighbors.length * 10;
    const node = nodeMap[fileId];
    if (node) {
      if (node.type === 'context') score += 50;
      if (node.type === 'api-module') score += 30;
      if (node.type === 'hook') score += 20;
    }
  }
  const level = score > 100 ? 'high' : score > 40 ? 'medium' : 'low';
  return { score: Math.min(score, 200), level };
}

describe('PR Impact — blast radius', () => {
  const links: MockLink[] = [
    { source: 'A', target: 'B', type: 'imports' },
    { source: 'B', target: 'C', type: 'imports' },
    { source: 'C', target: 'D', type: 'imports' },
    { source: 'D', target: 'E', type: 'imports' },
  ];
  const adjacency = buildAdjacency(links);

  it('finds direct dependents', () => {
    const selected = new Set(['B']);
    const result = computeBlastRadius(selected, adjacency);
    expect(result.has('A')).toBe(true);
    expect(result.has('C')).toBe(true);
  });

  it('finds transitive dependents (BFS)', () => {
    const selected = new Set(['B']);
    const result = computeBlastRadius(selected, adjacency);
    expect(result.has('D')).toBe(true);
    expect(result.has('E')).toBe(true);
  });

  it('excludes the selected file from indirectly affected', () => {
    const selected = new Set(['B']);
    const result = computeBlastRadius(selected, adjacency);
    expect(result.has('B')).toBe(false);
  });

  it('returns empty for isolated node', () => {
    const isolatedAdj = buildAdjacency([]);
    const selected = new Set(['Z']);
    const result = computeBlastRadius(selected, isolatedAdj);
    expect(result.size).toBe(0);
  });

  it('handles multiple selected files', () => {
    const selected = new Set(['B', 'D']);
    const result = computeBlastRadius(selected, adjacency);
    expect(result.has('A')).toBe(true);
    expect(result.has('C')).toBe(true);
    expect(result.has('E')).toBe(true);
    expect(result.has('B')).toBe(false);
    expect(result.has('D')).toBe(false);
  });
});

describe('PR Impact — risk score', () => {
  const nodes: MockNode[] = [
    { id: 'A', name: 'a.ts', type: 'page', relPath: 'src/a.ts', exports: [], lines: 100 },
    { id: 'B', name: 'b.ts', type: 'api-module', relPath: 'src/b.ts', exports: [], lines: 200 },
    { id: 'C', name: 'c.ts', type: 'hook', relPath: 'src/c.ts', exports: [], lines: 50 },
    { id: 'D', name: 'd.ts', type: 'context', relPath: 'src/d.ts', exports: [], lines: 80 },
  ];
  const nodeMap: Record<string, MockNode> = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  const links: MockLink[] = [
    { source: 'A', target: 'B', type: 'imports' },
    { source: 'A', target: 'C', type: 'imports' },
    { source: 'A', target: 'D', type: 'imports' },
  ];
  const adjacency = buildAdjacency(links);

  it('calculates base risk from number of neighbors', () => {
    const result = computeRiskScore(new Set(['A']), adjacency, nodeMap);
    expect(result.score).toBeGreaterThanOrEqual(30);
  });

  it('adds bonus for context type', () => {
    const contextAdj = { D: ['A', 'B', 'C'] } as Record<string, string[]>;
    const result = computeRiskScore(new Set(['D']), contextAdj, nodeMap);
    expect(result.score).toBeGreaterThanOrEqual(50);
  });

  it('caps risk score at 200', () => {
    const bigAdj: Record<string, string[]> = {};
    bigAdj['B'] = Array.from({ length: 50 }, (_, i) => `X${i}`);
    const result = computeRiskScore(new Set(['B']), bigAdj, nodeMap);
    expect(result.score).toBeLessThanOrEqual(200);
  });

  it('determines correct risk levels', () => {
    const lowAdj = { A: [] } as Record<string, string[]>;
    expect(computeRiskScore(new Set(['A']), lowAdj, nodeMap).level).toBe('low');

    const medAdj = { A: ['X', 'Y', 'Z', 'W', 'V'] } as Record<string, string[]>;
    expect(computeRiskScore(new Set(['A']), medAdj, nodeMap).level).toBe('medium');

    const highAdj = { D: Array.from({ length: 15 }, (_, i) => `X${i}`) } as Record<string, string[]>;
    expect(computeRiskScore(new Set(['D']), highAdj, nodeMap).level).toBe('high');
  });
});

describe('apiHelpers', () => {
  it('cleanQuery strips undefined values', () => {
    const result = cleanQuery({ q: 'test', page: undefined, limit: null, sort: 'asc' });
    expect(result).toEqual({ q: 'test', sort: 'asc' });
  });

  it('cleanQuery preserves all values when none are undefined', () => {
    const result = cleanQuery({ a: 1, b: 'two', c: true });
    expect(result).toEqual({ a: 1, b: 'two', c: true });
  });

  it('buildUrl encodes path segments', () => {
    const url = buildUrl('/api', ['hello world', 'foo/bar']);
    expect(url).toBe('/api/hello%20world/foo%2Fbar');
  });

  it('buildUrl appends query params and strips undefined', () => {
    const url = buildUrl('/api', [], { q: 'test', page: undefined, sort: 'asc' });
    expect(url).toBe('/api?q=test&sort=asc');
  });
});
