import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { IMMERSIVE_EDGES, IMMERSIVE_SERVICES } from '../config/services';
import { useSceneStore } from '../store/sceneStore';

const BAND: Record<string, string> = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
};

/** D3 flat fallback when WebGL is unavailable / forced off. */
export function FlatGraph() {
  const ref = useRef<SVGSVGElement | null>(null);
  const nodes = useSceneStore((s) => s.nodes);
  const filters = useSceneStore((s) => s.filters);
  const setSelectedNode = useSceneStore((s) => s.setSelectedNode);

  useEffect(() => {
    if (!ref.current) return;
    const width = ref.current.clientWidth || 900;
    const height = ref.current.clientHeight || 600;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const visible = IMMERSIVE_SERVICES.filter((s) => filters[s.category]);
    const simNodes = visible.map((s) => ({
      id: s.id,
      name: s.name,
      band: nodes[s.id]?.healthBand ?? 'green',
      r: 10 + (nodes[s.id]?.connections ?? 1) * 2,
    }));
    const idSet = new Set(simNodes.map((n) => n.id));
    const links = IMMERSIVE_EDGES.filter(([a, b]) => idSet.has(a) && idSet.has(b)).map(([source, target]) => ({
      source,
      target,
    }));

    const sim = d3
      .forceSimulation(simNodes as d3.SimulationNodeDatum[])
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => (d as { id: string }).id)
          .distance(90)
      )
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(24));

    const link = svg
      .append('g')
      .attr('stroke', '#475569')
      .selectAll('line')
      .data(links)
      .join('line');

    const node = svg
      .append('g')
      .selectAll('g')
      .data(simNodes)
      .join('g')
      .style('cursor', 'pointer')
      .on('click', (_, d) => setSelectedNode(d.id));

    node.append('circle').attr('r', (d) => d.r).attr('fill', (d) => BAND[d.band] ?? '#22c55e');
    node
      .append('text')
      .text((d) => d.name)
      .attr('x', 12)
      .attr('y', 4)
      .attr('fill', '#cbd5e1')
      .attr('font-size', 11);

    sim.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as unknown as { x: number }).x)
        .attr('y1', (d) => (d.source as unknown as { y: number }).y)
        .attr('x2', (d) => (d.target as unknown as { x: number }).x)
        .attr('y2', (d) => (d.target as unknown as { y: number }).y);
      node.attr('transform', (d) => `translate(${(d as { x?: number }).x ?? 0},${(d as { y?: number }).y ?? 0})`);
    });

    return () => {
      sim.stop();
    };
  }, [nodes, filters, setSelectedNode]);

  return <svg ref={ref} className="flat-graph" />;
}
