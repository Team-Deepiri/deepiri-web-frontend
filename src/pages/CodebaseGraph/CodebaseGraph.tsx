import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Download, Maximize2, Minimize2, 
  RefreshCw, FileText, Database, GitBranch,
  Zap, Link2, Box,
  ExternalLink, Network
} from 'lucide-react';
import './CodebaseGraph.css';

interface GraphNode {
  id: string;
  name: string;
  type: string;
  relPath: string;
  exports: string[];
  externalDeps: string[];
  componentsUsed: string[];
  hooksUsed: string[];
  lines: number;
  docstrings: string[];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
}

interface ResolvedGraphLink {
  source: GraphNode;
  target: GraphNode;
  type: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  meta: { analyzedAt: string; fileCount: number };
}

const TYPE_COLORS: Record<string, string> = {
  'page': '#6366f1',
  'component': '#8b5cf6',
  'gamification-component': '#a855f7',
  'chat-component': '#c084fc',
  'chat-widget': '#d946ef',
  'context': '#f97316',
  'api-module': '#10b981',
  'hook': '#f59e0b',
  'utility': '#06b6d4',
  'type-definition': '#64748b',
  'stylesheet': '#ec4899',
  'module': '#94a3b8',
};

interface DetailPanelProps {
  node: GraphNode | null;
  links: GraphLink[];
  allNodes: GraphNode[];
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ node, links, allNodes, onClose }) => {
  if (!node) return null;

  const incoming = links.filter(l => {
    const targetId = typeof l.target === 'object' ? l.target.id : l.target;
    return targetId === node.id;
  });
  const outgoing = links.filter(l => {
    const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
    return sourceId === node.id;
  });

  const getNodeName = (id: string) => {
    const n = allNodes.find(n => n.id === id);
    return n ? n.name : id.split('/').pop() || id;
  };

  return (
    <motion.div
      className="cg-detail-panel"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="cg-detail-header">
        <div>
          <h3>{node.name}</h3>
          <span className="cg-detail-path">{node.relPath}</span>
        </div>
        <button onClick={onClose} className="cg-close-btn">&times;</button>
      </div>

      <div className="cg-detail-section">
        <div className="cg-detail-tags">
          <span className="cg-tag" style={{ background: `${TYPE_COLORS[node.type]}22`, color: TYPE_COLORS[node.type], borderColor: `${TYPE_COLORS[node.type]}44` }}>
            {node.type.replace(/-/g, ' ')}
          </span>
          <span className="cg-tag cg-tag-lines">{node.lines} lines</span>
        </div>
      </div>

      {node.docstrings.length > 0 && (
        <div className="cg-detail-section">
          <h4>Description</h4>
          {node.docstrings.map((d, i) => (
            <p key={i} className="cg-detail-docstring">{d}</p>
          ))}
        </div>
      )}

      {node.exports.length > 0 && (
        <div className="cg-detail-section">
          <h4>Exports</h4>
          <div className="cg-detail-list">
            {node.exports.map((e, i) => (
              <span key={i} className="cg-detail-item cg-detail-item-export">{e}</span>
            ))}
          </div>
        </div>
      )}

      {node.hooksUsed.length > 0 && (
        <div className="cg-detail-section">
          <h4><Zap size={12} /> Hooks Used</h4>
          <div className="cg-detail-list">
            {node.hooksUsed.map((h, i) => (
              <span key={i} className="cg-detail-item cg-detail-item-hook">{h}</span>
            ))}
          </div>
        </div>
      )}

      {node.componentsUsed.length > 0 && (
        <div className="cg-detail-section">
          <h4><Box size={12} /> Components Used</h4>
          <div className="cg-detail-list">
            {node.componentsUsed.map((c, i) => (
              <span key={i} className="cg-detail-item cg-detail-item-comp">{c}</span>
            ))}
          </div>
        </div>
      )}

      {node.externalDeps.length > 0 && (
        <div className="cg-detail-section">
          <h4><Database size={12} /> External Packages</h4>
          <div className="cg-detail-list">
            {node.externalDeps.map((d, i) => (
              <span key={i} className="cg-detail-item cg-detail-item-dep">{d}</span>
            ))}
          </div>
        </div>
      )}

      {outgoing.length > 0 && (
        <div className="cg-detail-section">
          <h4><GitBranch size={12} /> Depends On ({outgoing.length})</h4>
          <div className="cg-detail-list">
            {outgoing.slice(0, 20).map((l, i) => {
              const targetId = typeof l.target === 'object' ? l.target.id : l.target;
              return (
                <span key={i} className="cg-detail-item cg-detail-item-dep">
                  {getNodeName(targetId)}
                  <span className="cg-link-type">{l.type}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {incoming.length > 0 && (
        <div className="cg-detail-section">
          <h4><Link2 size={12} /> Used By ({incoming.length})</h4>
          <div className="cg-detail-list">
            {incoming.slice(0, 20).map((l, i) => {
              const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
              return (
                <span key={i} className="cg-detail-item cg-detail-item-dep">
                  {getNodeName(sourceId)}
                  <span className="cg-link-type">{l.type}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

interface StatsBarProps {
  data: GraphData;
  activeFilters: Set<string>;
  onToggleFilter: (type: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const StatsBar: React.FC<StatsBarProps> = ({ data, activeFilters, onToggleFilter, searchQuery, setSearchQuery }) => {
  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    data.nodes.forEach(n => { s[n.type] = (s[n.type] || 0) + 1; });
    return s;
  }, [data]);

  const linkStats = useMemo(() => {
    const s: Record<string, number> = {};
    data.links.forEach(l => { s[l.type] = (s[l.type] || 0) + 1; });
    return s;
  }, [data]);

  return (
    <div className="cg-sidebar">
      <div className="cg-sidebar-header">
        <Network size={20} />
        <h2>Codebase Intelligence</h2>
      </div>

      <div className="cg-search-wrap">
        <Search size={14} />
        <input
          type="text"
          placeholder="Search files, components, hooks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="cg-stats-grid">
        <div className="cg-stat">
          <span className="cg-stat-value">{data.nodes.length}</span>
          <span className="cg-stat-label">Files</span>
        </div>
        <div className="cg-stat">
          <span className="cg-stat-value">{data.links.length}</span>
          <span className="cg-stat-label">Links</span>
        </div>
        <div className="cg-stat">
          <span className="cg-stat-value">{Object.keys(stats).length}</span>
          <span className="cg-stat-label">Types</span>
        </div>
        <div className="cg-stat">
          <span className="cg-stat-value">
            {data.nodes.reduce((sum, n) => sum + (n.externalDeps?.length || 0), 0)}
          </span>
          <span className="cg-stat-label">Packages</span>
        </div>
      </div>

      <div className="cg-filter-section">
        <h4>File Types</h4>
        <div className="cg-filter-grid">
          {Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <button
                key={type}
                className={`cg-filter-btn ${activeFilters.has(type) ? 'active' : ''}`}
                onClick={() => onToggleFilter(type)}
                style={{ '--filter-color': TYPE_COLORS[type] } as React.CSSProperties}
              >
                <span className="cg-filter-dot" />
                {type.replace(/-/g, ' ')}
                <span className="cg-filter-count">{count}</span>
              </button>
            ))}
        </div>
      </div>

      <div className="cg-filter-section">
        <h4>Relationship Types</h4>
        <div className="cg-link-stats">
          {Object.entries(linkStats).map(([type, count]) => (
            <div key={type} className="cg-link-stat">
              <span className="cg-link-stat-dot" style={{ background: type === 'imports' ? '#6366f1' : type === 'uses-hook' ? '#f59e0b' : '#f97316' }} />
              <span className="cg-link-stat-type">{type}</span>
              <span className="cg-link-stat-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cg-export-section">
        <h4>Export</h4>
        <div className="cg-export-buttons">
          <a href="/graph.html" target="_blank" rel="noreferrer" className="cg-export-btn">
            <ExternalLink size={14} />
            Standalone HTML
          </a>
          <a href="/graph/REPORT.md" target="_blank" rel="noreferrer" className="cg-export-btn">
            <FileText size={14} />
            Markdown Report
          </a>
          <a href="/graph/graph.json" download className="cg-export-btn">
            <Download size={14} />
            JSON Graph
          </a>
        </div>
      </div>

      <div className="cg-meta">
        Last analyzed: {new Date(data.meta.analyzedAt).toLocaleString()}
      </div>
    </div>
  );
};

const CodebaseGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<ResolvedGraphLink[]>([]);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const draggingNodeRef = useRef<GraphNode | null>(null);
  const panningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const didDragRef = useRef(false);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    fetch('/graph/graph.json')
      .then(r => r.json())
      .then((d: GraphData) => {
        setData(d);
        setActiveFilters(new Set(Object.keys(TYPE_COLORS)));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const simulate = useCallback(() => {
    if (!data) return;

    const nodes = data.nodes.map((n, i) => ({
      ...n,
      x: n.x ?? (Math.cos(i * 2.39996) * Math.sqrt(data.nodes.length) * 15),
      y: n.y ?? (Math.sin(i * 2.39996) * Math.sqrt(data.nodes.length) * 15),
      vx: 0,
      vy: 0,
    }));

    const nodeMap: Record<string, GraphNode> = {};
    nodes.forEach(n => nodeMap[n.id] = n);

    const links = data.links
      .filter(l => nodeMap[typeof l.source === 'object' ? l.source.id : l.source] && nodeMap[typeof l.target === 'object' ? l.target.id : l.target])
      .map(l => ({
        ...l,
        source: nodeMap[typeof l.source === 'object' ? l.source.id : l.source],
        target: nodeMap[typeof l.target === 'object' ? l.target.id : l.target],
      }));

    nodesRef.current = nodes;
    linksRef.current = links;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let alpha = 1;
    const decay = 0.0228;
    const velocityDecay = 0.4;

    const tick = () => {
      alpha += (0 - alpha) * decay;
      if (alpha < 0.001) { animFrameRef.current = requestAnimationFrame(render); return; }

      for (const node of nodes) {
        node.vx *= velocityDecay;
        node.vy *= velocityDecay;
      }

      const centerX = canvas.clientWidth / 2;
      const centerY = canvas.clientHeight / 2;
      for (const node of nodes) {
        node.vx += (centerX - node.x) * 0.0005;
        node.vy += (centerY - node.y) * 0.0005;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x! - nodes[i].x!;
          const dy = nodes[j].y! - nodes[i].y!;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = -800 / (dist * dist);
          const fx = (dx / dist) * force * alpha;
          const fy = (dy / dist) * force * alpha;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      for (const link of links) {
        const s = link.source as GraphNode;
        const t = link.target as GraphNode;
        const dx = t.x! - s.x!;
        const dy = t.y! - s.y!;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 120;
        const force = (dist - targetDist) * 0.003 * alpha;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        s.vx! += fx;
        s.vy! += fy;
        t.vx! -= fx;
        t.vy! -= fy;
      }

      for (const node of nodes) {
        if (node === draggingNodeRef.current) continue;
        node.x! += node.vx!;
        node.y! += node.vy!;
      }

      render();
      animFrameRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, [data]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const { x: tx, y: ty, k: scale } = transformRef.current;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);

    const searchLower = searchQuery.toLowerCase();
    const isSearching = searchLower.length > 0;

    for (const link of linksRef.current) {
      const s = link.source as GraphNode;
      const t = link.target as GraphNode;
      if (!activeFilters.has(s.type) || !activeFilters.has(t.type)) continue;

      let opacity = 0.08;
      if (selectedNode && (s.id === selectedNode.id || t.id === selectedNode.id)) {
        opacity = 0.6;
      } else if (hoveredNode && (s.id === hoveredNode.id || t.id === hoveredNode.id)) {
        opacity = 0.5;
      } else if (isSearching) {
        const sMatch = s.name.toLowerCase().includes(searchLower) || s.relPath.toLowerCase().includes(searchLower);
        const tMatch = t.name.toLowerCase().includes(searchLower) || t.relPath.toLowerCase().includes(searchLower);
        opacity = (sMatch || tMatch) ? 0.3 : 0.02;
      }

      ctx.beginPath();
      ctx.moveTo(s.x!, s.y!);
      ctx.lineTo(t.x!, t.y!);
      ctx.strokeStyle = link.type === 'imports' ? `rgba(99,102,241,${opacity})` :
        link.type === 'uses-hook' ? `rgba(245,158,11,${opacity})` : `rgba(249,115,22,${opacity})`;
      ctx.lineWidth = (selectedNode && (s.id === selectedNode.id || t.id === selectedNode.id)) ? 1.5 : 0.5;
      ctx.stroke();
    }

    for (const node of nodesRef.current) {
      if (!activeFilters.has(node.type)) continue;

      let radius = Math.min(Math.sqrt(node.lines || 10) + 3, 16);
      let opacity = 0.7;
      let strokeOpacity = 0.4;

      if (isSearching) {
        const match = node.name.toLowerCase().includes(searchLower) ||
          node.relPath.toLowerCase().includes(searchLower) ||
          node.type.includes(searchLower) ||
          node.exports.some(e => e.toLowerCase().includes(searchLower));
        if (match) { opacity = 1; radius *= 1.3; } else { opacity = 0.08; strokeOpacity = 0.05; }
      }

      if (selectedNode) {
        if (node.id === selectedNode.id) { opacity = 1; radius *= 1.5; strokeOpacity = 1; }
        else {
          const connected = linksRef.current.some(l =>
            (l.source.id === selectedNode.id && l.target.id === node.id) ||
            (l.target.id === selectedNode.id && l.source.id === node.id)
          );
          if (connected) { opacity = 0.9; } else { opacity = 0.06; strokeOpacity = 0.03; }
        }
      }

      if (hoveredNode && !selectedNode) {
        if (node.id === hoveredNode.id) { opacity = 1; radius *= 1.3; }
        else {
          const connected = linksRef.current.some(l =>
            (l.source.id === hoveredNode.id && l.target.id === node.id) ||
            (l.target.id === hoveredNode.id && l.source.id === node.id)
          );
          if (connected) { opacity = 0.8; } else { opacity = 0.15; }
        }
      }

      const color = TYPE_COLORS[node.type] || '#94a3b8';

      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = `${color}15`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.fill();
      ctx.globalAlpha = strokeOpacity;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1;

      if ((scale > 0.5 && opacity > 0.3 && radius > 4) || node.id === selectedNode?.id || node.id === hoveredNode?.id) {
        ctx.fillStyle = `rgba(226,232,240,${opacity})`;
        ctx.font = `${Math.max(9, 10 / Math.max(scale, 0.5))}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x!, node.y! + radius + 12);
      }
    }

    ctx.restore();
  }, [activeFilters, selectedNode, hoveredNode, searchQuery]);

  useEffect(() => {
    if (!data) return;
    simulate();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [data, simulate]);

  useEffect(() => {
    render();
  }, [render]);

  const screenToGraph = useCallback((sx: number, sy: number) => {
    const { x, y, k } = transformRef.current;
    return { x: (sx - x) / k, y: (sy - y) / k };
  }, []);

  const findNodeAt = useCallback((sx: number, sy: number): GraphNode | null => {
    const gp = screenToGraph(sx, sy);
    for (const node of nodesRef.current) {
      if (!activeFilters.has(node.type)) continue;
      const r = Math.min(Math.sqrt(node.lines || 10) + 3, 16) + 4;
      const dx = gp.x - node.x!;
      const dy = gp.y - node.y!;
      if (dx * dx + dy * dy < r * r) return node;
    }
    return null;
  }, [activeFilters, screenToGraph]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      setMousePos({ x: e.clientX, y: e.clientY });

      if (panningRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        transformRef.current.x = panStartRef.current.tx + dx;
        transformRef.current.y = panStartRef.current.ty + dy;
        render();
        return;
      }

      if (draggingNodeRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        if (!didDragRef.current && (dx * dx + dy * dy > 25)) {
          didDragRef.current = true;
        }
        if (didDragRef.current) {
          const gp = screenToGraph(sx, sy);
          draggingNodeRef.current.x = gp.x;
          draggingNodeRef.current.y = gp.y;
          draggingNodeRef.current.vx = 0;
          draggingNodeRef.current.vy = 0;
        }
        return;
      }

      const node = findNodeAt(sx, sy);
      setHoveredNode(node);
      canvas.style.cursor = node ? 'pointer' : 'grab';
    };

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const node = findNodeAt(sx, sy);
      if (node) {
        draggingNodeRef.current = node;
        didDragRef.current = false;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
      } else {
        panningRef.current = true;
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          tx: transformRef.current.x,
          ty: transformRef.current.y,
        };
        canvas.style.cursor = 'grabbing';
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (panningRef.current) {
        panningRef.current = false;
        canvas.style.cursor = 'grab';
        return;
      }
      if (draggingNodeRef.current) {
        if (didDragRef.current) {
          draggingNodeRef.current = null;
          canvas.style.cursor = 'grab';
          return;
        }
        draggingNodeRef.current = null;
        canvas.style.cursor = 'pointer';
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const node = findNodeAt(sx, sy);
        setSelectedNode(node);
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const node = findNodeAt(sx, sy);
      setSelectedNode(node);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const t = transformRef.current;
      const newK = Math.min(Math.max(t.k * factor, 0.05), 5);
      t.x = mx - (mx - t.x) * (newK / t.k);
      t.y = my - (my - t.y) * (newK / t.k);
      t.k = newK;
      render();
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [findNodeAt, render, screenToGraph]);

  useEffect(() => {
    const handleResize = () => render();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  const handleToggleFilter = useCallback((type: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const handleRecenter = useCallback(() => {
    transformRef.current = { x: 0, y: 0, k: 1 };
    render();
  }, [render]);

  if (isLoading) {
    return (
      <div className="cg-loading">
        <motion.div
          className="cg-loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <Network size={48} />
        </motion.div>
        <p>Analyzing codebase...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="cg-empty">
        <Network size={48} />
        <h2>No Graph Data</h2>
        <p>Run the analyzer to generate the codebase graph:</p>
        <code>node scripts/analyze.mjs</code>
      </div>
    );
  }

  return (
    <div className={`cg-container ${isFullscreen ? 'cg-fullscreen' : ''}`}>
      <StatsBar
        data={data}
        activeFilters={activeFilters}
        onToggleFilter={handleToggleFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="cg-canvas-wrap" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="cg-canvas"
          style={{ width: '100%', height: '100%' }}
        />

        <div className="cg-toolbar">
          <button onClick={handleRecenter} title="Recenter">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} title="Toggle fullscreen">
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {hoveredNode && !selectedNode && (
          <div
            className="cg-hover-tooltip"
            style={{ left: mousePos.x + 16, top: mousePos.y - 10 }}
          >
            <strong>{hoveredNode.name}</strong>
            <span className="cg-hover-type" style={{ color: TYPE_COLORS[hoveredNode.type] }}>
              {hoveredNode.type.replace(/-/g, ' ')}
            </span>
            <span className="cg-hover-path">{hoveredNode.relPath}</span>
          </div>
        )}

        <AnimatePresence>
          {selectedNode && (
            <DetailPanel
              node={selectedNode}
              links={data.links}
              allNodes={data.nodes}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CodebaseGraph;
