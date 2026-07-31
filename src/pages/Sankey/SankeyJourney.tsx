import React, { useEffect, useMemo, useRef, useState } from 'react';
import { sankey, sankeyLinkHorizontal, type SankeyGraph, type SankeyNode, type SankeyLink } from 'd3-sankey';
import { useHealthStore } from '../../store/healthStore';
import './SankeyJourney.css';

type NodeExtra = { id: string; name: string; down?: boolean };
type LinkExtra = { value: number };

const JOURNEYS = [
  { id: 'auth-login', label: 'Auth login', hops: ['api-gateway', 'auth-service', 'realtime-gateway'] },
  { id: 'jobs-run', label: 'Jobs enqueue', hops: ['api-gateway', 'jobs', 'truss', 'telemetry'] },
  { id: 'ai-ask', label: 'Cyrex ask', hops: ['api-gateway', 'cyrex', 'realtime-gateway'] },
  { id: 'registry', label: 'Registry lookup', hops: ['api-gateway', 'registry', 'telemetry'] },
] as const;

const SankeyJourney: React.FC = () => {
  const services = useHealthStore((s) => s.services);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [journeyId, setJourneyId] = useState<(typeof JOURNEYS)[number]['id']>('auth-login');
  const [traceT, setTraceT] = useState(0);

  const byId = useMemo(() => new Map(services.map((s) => [s.serviceId, s])), [services]);

  const graphModel = useMemo(() => {
    const ids = ['client', ...services.map((s) => s.serviceId)];
    const nodes: Array<SankeyNode<NodeExtra, LinkExtra>> = ids.map((id) => ({
      id,
      name: id === 'client' ? 'Client Hub' : byId.get(id)?.name ?? id,
      down: id !== 'client' && byId.get(id)?.status === 'down',
    }));
    const index = new Map(ids.map((id, i) => [id, i]));
    const links: Array<SankeyLink<NodeExtra, LinkExtra>> = [];

    const pushLink = (a: string, b: string, value: number) => {
      const source = index.get(a);
      const target = index.get(b);
      if (source == null || target == null || value <= 0) return;
      // Collapse width when target is down
      const targetDown = byId.get(b)?.status === 'down';
      links.push({ source, target, value: targetDown ? Math.max(1, value * 0.15) : value });
    };

    pushLink('client', 'api-gateway', 40);
    pushLink('api-gateway', 'auth-service', 18);
    pushLink('api-gateway', 'jobs', 12);
    pushLink('api-gateway', 'registry', 10);
    pushLink('api-gateway', 'cyrex', 8);
    pushLink('api-gateway', 'realtime-gateway', 14);
    pushLink('jobs', 'truss', 9);
    pushLink('truss', 'telemetry', 7);
    pushLink('registry', 'telemetry', 6);
    pushLink('auth-service', 'realtime-gateway', 8);
    pushLink('cyrex', 'realtime-gateway', 5);

    return { nodes, links };
  }, [services, byId]);

  useEffect(() => {
    if (!svgRef.current) return;
    const width = svgRef.current.clientWidth || 900;
    const height = 420;
    const layout = sankey<NodeExtra, LinkExtra>()
      .nodeWidth(16)
      .nodePadding(18)
      .extent([
        [24, 16],
        [width - 24, height - 16],
      ]);

    const graph: SankeyGraph<NodeExtra, LinkExtra> = layout({
      nodes: graphModel.nodes.map((n) => ({ ...n })),
      links: graphModel.links.map((l) => ({ ...l })),
    });

    const svg = svgRef.current;
    // Clear children
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const ns = 'http://www.w3.org/2000/svg';
    const gLinks = document.createElementNS(ns, 'g');
    const gNodes = document.createElementNS(ns, 'g');
    svg.appendChild(gLinks);
    svg.appendChild(gNodes);

    const pathGen = sankeyLinkHorizontal();
    for (const link of graph.links) {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', pathGen(link) ?? '');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#475569');
      path.setAttribute('stroke-opacity', '0.45');
      path.setAttribute('stroke-width', String(Math.max(1, link.width ?? 1)));
      gLinks.appendChild(path);
    }

    for (const node of graph.nodes) {
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', String(node.x0 ?? 0));
      rect.setAttribute('y', String(node.y0 ?? 0));
      rect.setAttribute('width', String((node.x1 ?? 0) - (node.x0 ?? 0)));
      rect.setAttribute('height', String(Math.max(1, (node.y1 ?? 0) - (node.y0 ?? 0))));
      rect.setAttribute('fill', node.down ? '#ef4444' : '#6366f1');
      rect.setAttribute('rx', '3');
      gNodes.appendChild(rect);

      const text = document.createElementNS(ns, 'text');
      text.textContent = node.name;
      text.setAttribute('x', String((node.x1 ?? 0) + 6));
      text.setAttribute('y', String(((node.y0 ?? 0) + (node.y1 ?? 0)) / 2));
      text.setAttribute('fill', '#cbd5e1');
      text.setAttribute('font-size', '11');
      text.setAttribute('dominant-baseline', 'middle');
      gNodes.appendChild(text);
    }

    // Journey tracer dot along selected hops
    const journey = JOURNEYS.find((j) => j.id === journeyId)!;
    const hopNodes = journey.hops
      .map((id) => graph.nodes.find((n) => n.id === id))
      .filter(Boolean) as Array<SankeyNode<NodeExtra, LinkExtra>>;

    if (hopNodes.length >= 2) {
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('r', '6');
      dot.setAttribute('fill', '#fbbf24');
      dot.setAttribute('filter', 'url(#glow)');
      const defs = document.createElementNS(ns, 'defs');
      defs.innerHTML =
        '<filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
      svg.prepend(defs);
      svg.appendChild(dot);

      const points = hopNodes.map((n) => ({
        x: ((n.x0 ?? 0) + (n.x1 ?? 0)) / 2,
        y: ((n.y0 ?? 0) + (n.y1 ?? 0)) / 2,
        down: Boolean(n.down),
      }));

      const t = traceT % 1;
      const seg = Math.min(points.length - 2, Math.floor(t * (points.length - 1)));
      const localT = t * (points.length - 1) - seg;
      const a = points[seg];
      const b = points[seg + 1];
      const x = a.x + (b.x - a.x) * localT;
      const y = a.y + (b.y - a.y) * localT;
      dot.setAttribute('cx', String(x));
      dot.setAttribute('cy', String(y));
      if (a.down || b.down) dot.setAttribute('fill', '#ef4444');
    }
  }, [graphModel, journeyId, traceT]);

  useEffect(() => {
    const id = setInterval(() => setTraceT((t) => (t + 0.008) % 1), 32);
    return () => clearInterval(id);
  }, []);

  const journey = JOURNEYS.find((j) => j.id === journeyId)!;
  const hopTiming = journey.hops.map((id) => {
    const svc = byId.get(id);
    return {
      id,
      latency: svc?.latencyMs ?? null,
      status: svc?.status ?? 'unknown',
      error: svc?.status === 'down' || svc?.status === 'degraded',
    };
  });

  return (
    <div className="sankey-page">
      <header className="sankey-toolbar">
        <div>
          <h1>Sankey + Journey Tracer</h1>
          <p>Traffic bands collapse when a service is down. Pick a journey to animate the hop path.</p>
        </div>
        <select
          value={journeyId}
          onChange={(e) => setJourneyId(e.target.value as (typeof JOURNEYS)[number]['id'])}
          aria-label="Request journey"
        >
          {JOURNEYS.map((j) => (
            <option key={j.id} value={j.id}>
              {j.label}
            </option>
          ))}
        </select>
      </header>

      <svg ref={svgRef} className="sankey-svg" />

      <ol className="sankey-hops">
        {hopTiming.map((h, i) => (
          <li key={h.id} className={h.error ? 'is-error' : ''}>
            <span>
              {i + 1}. {h.id}
            </span>
            <em>
              {h.status} · {h.latency ?? '—'} ms
            </em>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default SankeyJourney;
