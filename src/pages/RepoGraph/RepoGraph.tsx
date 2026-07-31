import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { ArrowLeft, RefreshCw, Search, Maximize2, Minimize2 } from 'lucide-react';
import {
  hubClient,
  type HubCommunity,
  type HubGraphNode,
  type HubRepoGraph,
} from '../../services/hubClient';
import './RepoGraph.css';

type SimNode = HubGraphNode & {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

const DRAG_THRESHOLD = 4;

function buildSimulation(graph: HubRepoGraph, width: number, height: number): SimNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const communities = graph.communities;
  const communityCenters = new Map<number, { x: number; y: number }>();
  communities.forEach((c, i) => {
    const angle = (i / Math.max(communities.length, 1)) * Math.PI * 2;
    const radius = Math.min(width, height) * 0.28;
    communityCenters.set(c.id, {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  });

  return graph.nodes.map((n, i) => {
    const center = communityCenters.get(n.communityId) ?? { x: cx, y: cy };
    const jitter = 40 + (i % 17);
    const a = (i * 2.399) % (Math.PI * 2);
    return {
      ...n,
      x: center.x + Math.cos(a) * jitter,
      y: center.y + Math.sin(a) * jitter,
      vx: 0,
      vy: 0,
    };
  });
}

function tick(
  nodes: SimNode[],
  edges: HubRepoGraph['edges'],
  width: number,
  height: number,
  alpha: number
): void {
  const cx = width / 2;
  const cy = height / 2;
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // Repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.hypot(dx, dy) || 0.01;
      const same = a.communityId === b.communityId;
      const minDist = same ? 28 : 55;
      if (dist < minDist * 3) {
        const force = ((minDist - dist) / dist) * 0.08 * alpha;
        dx *= force;
        dy *= force;
        a.vx -= dx;
        a.vy -= dy;
        b.vx += dx;
        b.vy += dy;
      }
    }
  }

  // Springs
  for (const e of edges) {
    const s = byId.get(e.source);
    const t = byId.get(e.target);
    if (!s || !t) continue;
    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const dist = Math.hypot(dx, dy) || 0.01;
    const ideal = 90;
    const force = ((dist - ideal) / dist) * 0.02 * alpha;
    s.vx += dx * force;
    s.vy += dy * force;
    t.vx -= dx * force;
    t.vy -= dy * force;
  }

  // Center + community gravity + integrate
  for (const n of nodes) {
    n.vx += (cx - n.x) * 0.002 * alpha;
    n.vy += (cy - n.y) * 0.002 * alpha;
    n.vx *= 0.85;
    n.vy *= 0.85;
    n.x += n.vx;
    n.y += n.vy;
    n.x = Math.max(12, Math.min(width - 12, n.x));
    n.y = Math.max(12, Math.min(height - 12, n.y));
  }
}

const RepoGraph: React.FC = () => {
  const { repoId: routeRepoId } = useParams<{ repoId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const simRef = useRef<SimNode[]>([]);
  const alphaRef = useRef(1);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const rafRef = useRef<number>(0);

  const [repoId, setRepoId] = useState(routeRepoId || searchParams.get('repo') || 'deepiri-web-frontend');
  const [enabledCommunities, setEnabledCommunities] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<HubGraphNode | null>(null);
  const [hover, setHover] = useState<HubGraphNode | null>(null);
  const [query, setQuery] = useState('');
  const [fullscreen, setFullscreen] = useState(false);

  const { data: repoList } = useQuery(['hub', 'graph-repos'], () => hubClient.listGraphRepos(), {
    staleTime: 60_000,
    retry: 1,
  });

  const {
    data: graph,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery(['hub', 'graph', repoId], () => hubClient.getRepoGraph(repoId), {
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (!graph) return;
    setEnabledCommunities(new Set(graph.communities.map((c) => c.name)));
    setSelected(null);
  }, [graph?.repoId, graph?.generatedAt]);

  useEffect(() => {
    if (routeRepoId && routeRepoId !== repoId) setRepoId(routeRepoId);
  }, [routeRepoId]);

  const colorByCommunity = useMemo(() => {
    const m = new Map<string, string>();
    graph?.communities.forEach((c) => m.set(c.name, c.color));
    return m;
  }, [graph]);

  const neighborIds = useMemo(() => {
    if (!selected || !graph) return new Set<string>();
    const s = new Set<string>([selected.id]);
    for (const e of graph.edges) {
      if (e.source === selected.id) s.add(e.target);
      if (e.target === selected.id) s.add(e.source);
    }
    return s;
  }, [selected, graph]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return { w: 800, h: 600 };
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: rect.width, h: rect.height };
  }, []);

  // Init / reset simulation when graph loads
  useEffect(() => {
    if (!graph) return;
    const { w, h } = resize();
    simRef.current = buildSimulation(graph, w, h);
    alphaRef.current = 1;
    transformRef.current = { x: 0, y: 0, k: 1 };
  }, [graph, resize]);

  // Animation loop
  useEffect(() => {
    if (!graph) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const { w, h } = resize();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (alphaRef.current > 0.02) {
        tick(simRef.current, graph.edges, w, h, alphaRef.current);
        alphaRef.current *= 0.985;
      }

      const { x: tx, y: ty, k } = transformRef.current;
      const q = query.trim().toLowerCase();
      const nodes = simRef.current;
      const byId = new Map(nodes.map((n) => [n.id, n]));

      ctx.clearRect(0, 0, w, h);
      // Atmosphere
      const g = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, w * 0.7);
      g.addColorStop(0, '#0b1220');
      g.addColorStop(1, '#05080f');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(k, k);

      // Edges
      ctx.lineWidth = 1 / k;
      for (const e of graph.edges) {
        const s = byId.get(e.source);
        const t = byId.get(e.target);
        if (!s || !t) continue;
        if (!enabledCommunities.has(s.community) || !enabledCommunities.has(t.community)) continue;
        const focus = !selected || neighborIds.has(s.id) || neighborIds.has(t.id);
        ctx.strokeStyle = focus ? 'rgba(148,163,184,0.35)' : 'rgba(148,163,184,0.06)';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }

      // Nodes
      for (const n of nodes) {
        if (!enabledCommunities.has(n.community)) continue;
        const matches = !q || n.label.toLowerCase().includes(q) || n.path.toLowerCase().includes(q);
        const focus = !selected || neighborIds.has(n.id);
        const dim = selected ? !focus : q ? !matches : false;
        const color = colorByCommunity.get(n.community) ?? '#94a3b8';
        const r = Math.max(3.5, Math.min(14, 3 + Math.sqrt(n.lines) * 0.35 + n.degree * 0.15));

        ctx.beginPath();
        ctx.fillStyle = dim ? `${color}33` : color;
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();

        if (selected?.id === n.id || hover?.id === n.id) {
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = 1.5 / k;
          ctx.stroke();
        }

        if ((selected?.id === n.id || hover?.id === n.id || (q && matches)) && !dim) {
          ctx.fillStyle = '#e2e8f0';
          ctx.font = `${11 / k}px ui-sans-serif, system-ui, sans-serif`;
          ctx.fillText(n.label, n.x + r + 4 / k, n.y + 3 / k);
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [graph, enabledCommunities, selected, hover, query, neighborIds, colorByCommunity, resize]);

  // Pointer interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graph) return;

    let mode: 'none' | 'pan' | 'drag-node' | 'pending' = 'none';
    let startX = 0;
    let startY = 0;
    let originTx = 0;
    let originTy = 0;
    let dragged: SimNode | null = null;
    let moved = 0;

    const toWorld = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const { x: tx, y: ty, k } = transformRef.current;
      return {
        x: (clientX - rect.left - tx) / k,
        y: (clientY - rect.top - ty) / k,
      };
    };

    const hitTest = (wx: number, wy: number): SimNode | null => {
      const { k } = transformRef.current;
      let best: SimNode | null = null;
      let bestD = Infinity;
      for (const n of simRef.current) {
        if (!enabledCommunities.has(n.community)) continue;
        const r = Math.max(3.5, Math.min(14, 3 + Math.sqrt(n.lines) * 0.35 + n.degree * 0.15));
        const d = Math.hypot(n.x - wx, n.y - wy);
        if (d <= r + 4 / k && d < bestD) {
          best = n;
          bestD = d;
        }
      }
      return best;
    };

    const onDown = (ev: PointerEvent) => {
      const world = toWorld(ev.clientX, ev.clientY);
      const hit = hitTest(world.x, world.y);
      startX = ev.clientX;
      startY = ev.clientY;
      moved = 0;
      originTx = transformRef.current.x;
      originTy = transformRef.current.y;
      if (hit) {
        mode = 'pending';
        dragged = hit;
      } else {
        mode = 'pan';
        dragged = null;
        canvas.setPointerCapture(ev.pointerId);
      }
    };

    const onMove = (ev: PointerEvent) => {
      const world = toWorld(ev.clientX, ev.clientY);
      if (mode === 'none') {
        setHover(hitTest(world.x, world.y));
        return;
      }
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      moved = Math.hypot(dx, dy);

      if (mode === 'pending' && moved > DRAG_THRESHOLD && dragged) {
        mode = 'drag-node';
        canvas.setPointerCapture(ev.pointerId);
      }

      if (mode === 'pan') {
        transformRef.current.x = originTx + dx;
        transformRef.current.y = originTy + dy;
      } else if (mode === 'drag-node' && dragged) {
        dragged.x = world.x;
        dragged.y = world.y;
        dragged.vx = 0;
        dragged.vy = 0;
        alphaRef.current = Math.max(alphaRef.current, 0.15);
      } else {
        setHover(hitTest(world.x, world.y));
      }
    };

    const onUp = (ev: PointerEvent) => {
      if (mode === 'pending' && dragged && moved < DRAG_THRESHOLD) {
        setSelected((prev) => (prev?.id === dragged!.id ? null : { ...dragged! }));
      }
      mode = 'none';
      dragged = null;
      try {
        canvas.releasePointerCapture(ev.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      const { x: tx, y: ty, k } = transformRef.current;
      const nextK = Math.min(4, Math.max(0.25, k * (ev.deltaY < 0 ? 1.1 : 0.9)));
      transformRef.current = {
        k: nextK,
        x: mx - ((mx - tx) / k) * nextK,
        y: my - ((my - ty) / k) * nextK,
      };
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', resize);

    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', resize);
    };
  }, [graph, enabledCommunities, resize]);

  const toggleCommunity = (name: string) => {
    setEnabledCommunities((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const onSelectRepo = (id: string) => {
    setRepoId(id);
    setSearchParams({ repo: id });
  };

  const selectedNeighbors = useMemo(() => {
    if (!selected || !graph) return [];
    return graph.edges
      .filter((e) => e.source === selected.id || e.target === selected.id)
      .map((e) => (e.source === selected.id ? e.target : e.source));
  }, [selected, graph]);

  return (
    <div className={`repo-graph ${fullscreen ? 'repo-graph--fullscreen' : ''}`}>
      <header className="repo-graph-top">
        <div className="repo-graph-top-left">
          <Link to="/ops" className="repo-graph-back">
            <ArrowLeft size={16} /> Ops
          </Link>
          <h1 className="repo-graph-title">Repo Graph</h1>
          <select
            className="repo-graph-select"
            value={repoId}
            onChange={(e) => onSelectRepo(e.target.value)}
            aria-label="Select repository"
          >
            {(repoList?.repos ?? [{ id: repoId, name: repoId }]).map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="repo-graph-top-right">
          <div className="repo-graph-search">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nodes…"
              aria-label="Search graph nodes"
            />
          </div>
          <button
            type="button"
            className="repo-graph-btn"
            onClick={() => {
              void queryClient.invalidateQueries(['hub', 'graph', repoId]);
              void refetch();
            }}
            disabled={isFetching}
          >
            <RefreshCw size={14} /> Rebuild
          </button>
          <button
            type="button"
            className="repo-graph-btn"
            onClick={() => setFullscreen((v) => !v)}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </header>

      <div className="repo-graph-body">
        <aside className="repo-graph-sidebar" aria-label="Communities">
          <div className="repo-graph-sidebar-head">
            <span>COMMUNITIES</span>
            {graph && (
              <span className="repo-graph-meta">
                {graph.nodeCount} nodes · {graph.edgeCount} edges
              </span>
            )}
          </div>
          {isLoading && <p className="repo-graph-muted">Building graph…</p>}
          {isError && (
            <p className="repo-graph-error">
              Hub unreachable or graph failed.{' '}
              {(error as Error)?.message || 'Start hub-server on :5200.'}
            </p>
          )}
          <ul className="repo-graph-communities">
            {(graph?.communities ?? []).map((c: HubCommunity) => (
              <li key={c.name}>
                <label className="repo-graph-community">
                  <input
                    type="checkbox"
                    checked={enabledCommunities.has(c.name)}
                    onChange={() => toggleCommunity(c.name)}
                  />
                  <span className="repo-graph-swatch" style={{ background: c.color }} />
                  <span className="repo-graph-community-name" title={c.name}>
                    {c.name}
                  </span>
                  <span className="repo-graph-count">{c.count}</span>
                </label>
              </li>
            ))}
          </ul>
        </aside>

        <div className="repo-graph-canvas-wrap" ref={wrapRef}>
          <canvas ref={canvasRef} className="repo-graph-canvas" />
          {hover && !selected && (
            <div className="repo-graph-tooltip">
              <strong>{hover.label}</strong>
              <span>{hover.path}</span>
              <span>
                {hover.kind} · {hover.lines} lines · deg {hover.degree}
              </span>
            </div>
          )}
        </div>

        {selected && (
          <aside className="repo-graph-detail" aria-label="Node detail">
            <button type="button" className="repo-graph-detail-close" onClick={() => setSelected(null)}>
              Close
            </button>
            <h2>{selected.label}</h2>
            <p className="repo-graph-path">{selected.path}</p>
            <dl>
              <div>
                <dt>Kind</dt>
                <dd>{selected.kind}</dd>
              </div>
              <div>
                <dt>Community</dt>
                <dd>{selected.community}</dd>
              </div>
              <div>
                <dt>Lines</dt>
                <dd>{selected.lines}</dd>
              </div>
              <div>
                <dt>Degree</dt>
                <dd>{selected.degree}</dd>
              </div>
            </dl>
            <h3>Neighbors ({selectedNeighbors.length})</h3>
            <ul className="repo-graph-neighbors">
              {selectedNeighbors.slice(0, 40).map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => {
                      const n = graph?.nodes.find((x) => x.id === id);
                      if (n) setSelected(n);
                    }}
                  >
                    {id}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
};

export default RepoGraph;
