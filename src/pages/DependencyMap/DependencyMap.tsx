import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import * as d3 from 'd3';
import { hubClient } from '../../services/hubClient';
import { useHealthStore } from '../../store/healthStore';
import { communityEdgeMetric } from '../../services/metricsService';
import './DependencyMap.css';

type Mode = 'matrix' | 'graph';
type Metric = 'volume' | 'errorRate' | 'avgLatency' | 'p95';

const DependencyMap: React.FC = () => {
  const [repoId, setRepoId] = useState('deepiri-web-frontend');
  const [mode, setMode] = useState<Mode>('matrix');
  const [metric, setMetric] = useState<Metric>('volume');
  const [hover, setHover] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const services = useHealthStore((s) => s.services);

  const { data: repos } = useQuery(['hub', 'graph-repos'], () => hubClient.listGraphRepos(), {
    staleTime: 60_000,
    retry: 1,
  });

  const { data: graph, isLoading, isError, error } = useQuery(
    ['hub', 'dep-graph', repoId],
    () => hubClient.getRepoGraph(repoId),
    { staleTime: 60_000, retry: 1 }
  );

  const communities = graph?.communities ?? [];

  const matrix = useMemo(() => {
    if (!graph) return [] as number[][];
    const index = new Map(communities.map((c, i) => [c.name, i]));
    const n = communities.length;
    const raw = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
    const nodeCommunity = new Map(graph.nodes.map((node) => [node.id, node.community]));

    for (const e of graph.edges) {
      const a = index.get(nodeCommunity.get(e.source) ?? '');
      const b = index.get(nodeCommunity.get(e.target) ?? '');
      if (a == null || b == null) continue;
      raw[a][b] += 1;
    }

    // Approximate community health from overlapping service names / path tokens
    const bandFor = (communityName: string): string => {
      const hit = services.find((s) => communityName.toLowerCase().includes(s.serviceId.split('-')[0]));
      return hit?.healthBand ?? 'green';
    };

    const m = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        m[i][j] = communityEdgeMetric(raw[i][j], bandFor(communities[i].name), bandFor(communities[j].name), metric);
      }
    }
    return m;
  }, [graph, communities, metric, services]);

  const maxVal = useMemo(() => Math.max(1, ...matrix.flatMap((row) => row)), [matrix]);

  useEffect(() => {
    if (mode !== 'graph' || !graph || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 800;
    const height = 520;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    svg.selectAll('*').remove();

    type SimNode = { id: string; color: string; count: number; x?: number; y?: number };
    const nodes: SimNode[] = communities.map((c) => ({
      id: c.name,
      color: c.color,
      count: c.count,
    }));

    const links: Array<{ source: string; target: string; value: number }> = [];
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix.length; j++) {
        if (matrix[i][j] > 0 && i !== j) {
          links.push({
            source: communities[i].name,
            target: communities[j].name,
            value: matrix[i][j],
          });
        }
      }
    }

    const sim = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => (d as SimNode).id)
          .distance(110)
          .strength(0.2)
      )
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(28));

    const link = svg
      .append('g')
      .attr('stroke', '#334155')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => 1 + Math.sqrt(d.value));

    const node = svg.append('g').selectAll('g').data(nodes).join('g');

    node
      .append('circle')
      .attr('r', (d) => 10 + Math.sqrt(d.count))
      .attr('fill', (d) => d.color)
      .attr('opacity', 0.9);

    node
      .append('text')
      .text((d) => d.id.split('/').pop() ?? d.id)
      .attr('x', 14)
      .attr('y', 4)
      .attr('fill', '#cbd5e1')
      .attr('font-size', 10);

    sim.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as unknown as { x: number }).x)
        .attr('y1', (d) => (d.source as unknown as { y: number }).y)
        .attr('x2', (d) => (d.target as unknown as { x: number }).x)
        .attr('y2', (d) => (d.target as unknown as { y: number }).y);
      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      sim.stop();
    };
  }, [mode, graph, communities, matrix]);

  return (
    <div className="dep-map">
      <header className="dep-map-toolbar">
        <div>
          <h1>Dependency Map</h1>
          <p>Community heat matrix + force graph from Hub repo graphs.</p>
        </div>
        <div className="dep-map-controls">
          <select value={repoId} onChange={(e) => setRepoId(e.target.value)} aria-label="Repository">
            {(repos?.repos ?? [{ id: repoId, name: repoId }]).map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <div className="dep-map-toggle">
            <button type="button" className={mode === 'matrix' ? 'is-on' : ''} onClick={() => setMode('matrix')}>
              Matrix
            </button>
            <button type="button" className={mode === 'graph' ? 'is-on' : ''} onClick={() => setMode('graph')}>
              Graph
            </button>
          </div>
          <select value={metric} onChange={(e) => setMetric(e.target.value as Metric)} aria-label="Metric">
            <option value="volume">Request volume</option>
            <option value="errorRate">Error rate</option>
            <option value="avgLatency">Avg latency</option>
            <option value="p95">p95 latency</option>
          </select>
        </div>
      </header>

      {isLoading && <p className="dep-map-muted">Loading graph…</p>}
      {isError && <p className="dep-map-error">{(error as Error)?.message || 'Hub graph failed'}</p>}

      {mode === 'matrix' && graph && (
        <div className="dep-map-matrix-wrap">
          <table className="dep-map-matrix">
            <thead>
              <tr>
                <th />
                {communities.map((c) => (
                  <th key={c.name} title={c.name}>
                    {c.name.split('/').pop()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {communities.map((row, i) => (
                <tr key={row.name}>
                  <th title={row.name}>{row.name.split('/').pop()}</th>
                  {communities.map((col, j) => {
                    const v = matrix[i]?.[j] ?? 0;
                    const intensity = v / maxVal;
                    return (
                      <td
                        key={col.name}
                        style={{ background: `rgba(99, 102, 241, ${0.08 + intensity * 0.85})` }}
                        title={`${row.name} → ${col.name}: ${v}`}
                        onMouseEnter={() => setHover(`${row.name} → ${col.name}: ${v}`)}
                        onMouseLeave={() => setHover(null)}
                      >
                        {v || ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {hover && <div className="dep-map-hover">{hover}</div>}
        </div>
      )}

      {mode === 'graph' && <svg ref={svgRef} className="dep-map-svg" />}
    </div>
  );
};

export default DependencyMap;
