import { select } from 'd3-selection';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
} from 'd3-force';
import { drag } from 'd3-drag';
import { zoom, zoomIdentity } from 'd3-zoom';
import { TYPE_COLORS } from '@/utils/graphConstants';
import './graph.css';

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
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  meta: { analyzedAt: string; fileCount: number };
}

function getNodeId(n: string | GraphNode): string {
  return typeof n === 'object' ? n.id : n;
}

function buildTooltip(d: GraphNode, related: Set<string>): void {
  tooltip.replaceChildren();
  const h3 = document.createElement('h3');
  h3.textContent = d.name;
  tooltip.appendChild(h3);

  const path = document.createElement('div');
  path.className = 'path';
  path.textContent = d.relPath;
  tooltip.appendChild(path);

  const tagColor = TYPE_COLORS[d.type] || '#94a3b8';
  const typeTag = document.createElement('span');
  typeTag.className = 'tag';
  typeTag.textContent = d.type;
  typeTag.style.background = `${tagColor}22`;
  typeTag.style.color = tagColor;
  typeTag.style.border = `1px solid ${tagColor}44`;
  tooltip.appendChild(typeTag);

  const linesTag = document.createElement('span');
  linesTag.className = 'tag';
  linesTag.textContent = `${d.lines} lines`;
  linesTag.style.background = 'rgba(30, 41, 59, 0.8)';
  linesTag.style.color = '#94a3b8';
  tooltip.appendChild(linesTag);

  const rows: Array<[string, string[], string]> = [
    ['exports', d.exports, '#64748b'],
    ['hooks', d.hooksUsed, '#f59e0b'],
    ['components', d.componentsUsed, '#8b5cf6'],
    ['packages', d.externalDeps, '#10b981'],
    ['related files', [...related].filter(id => id !== d.id), '#64748b'],
  ];

  for (const [label, items, color] of rows) {
    if (items.length === 0) continue;
    const row = document.createElement('div');
    row.className = 'row';
    row.textContent = `${label}: ${items.join(', ')}`;
    row.style.color = color;
    tooltip.appendChild(row);
  }

  tooltip.style.display = 'block';
}

const tooltip = document.getElementById('tooltip') as HTMLDivElement;
const svg = select<SVGSVGElement, unknown>('#graph');
const width = window.innerWidth;
const height = window.innerHeight;
svg.attr('width', width).attr('height', height);

const defs = svg.append('defs');
const glow = defs.append('filter').attr('id', 'glow');
glow.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
const feMerge = glow.append('feMerge');
feMerge.append('feMergeNode').attr('in', 'coloredBlur');
feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

const g = svg.append('g');
const zoomBehavior = zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.1, 4])
  .on('zoom', event => g.attr('transform', event.transform));
svg.call(zoomBehavior);

const linkGroup = g.append('g').attr('class', 'links');
const nodeGroup = g.append('g').attr('class', 'nodes');

const loadData = async (): Promise<GraphData> => {
  const res = await fetch('/graph/graph.json');
  if (!res.ok) throw new Error(`Failed to load graph: ${res.status}`);
  return res.json();
};

loadData()
  .then((data: GraphData) => {
    const stats: Record<string, number> = {};
    data.nodes.forEach(n => {
      stats[n.type] = (stats[n.type] || 0) + 1;
    });

    const statsEl = document.getElementById('stats');
    if (statsEl) {
      const fileCount = document.createElement('div');
      fileCount.append('Analyzing ');
      const files = document.createElement('span');
      files.textContent = String(data.nodes.length);
      fileCount.append(files, ' files across ');
      const cats = document.createElement('span');
      cats.textContent = String(Object.keys(stats).length);
      fileCount.append(cats, ' categories');
      const rel = document.createElement('div');
      const relCount = document.createElement('span');
      relCount.textContent = String(data.links.length);
      rel.append(relCount, ' relationships mapped');
      const gen = document.createElement('div');
      gen.append('Generated ');
      const genDate = document.createElement('span');
      genDate.textContent = new Date(data.meta.analyzedAt).toLocaleString();
      gen.append(genDate);
      statsEl.append(fileCount, rel, gen);
    }

    const simulation = forceSimulation<GraphNode>(data.nodes)
      .force('link', forceLink<GraphNode, GraphLink>(data.links).id(d => d.id).distance(80).strength(0.3))
      .force('charge', forceManyBody<GraphNode>().strength(-200))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide<GraphNode>().radius(d => Math.sqrt(d.lines || 10) + 8))
      .force('x', forceX(width / 2).strength(0.05))
      .force('y', forceY(height / 2).strength(0.05));

    const link = linkGroup
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(data.links)
      .join('line')
      .attr('stroke', d => (d.type === 'imports' ? 'rgba(99,102,241,0.15)' : 'rgba(249,115,22,0.1)'))
      .attr('stroke-width', 1);

    const node = nodeGroup
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', d => Math.min(Math.sqrt(d.lines || 10) + 3, 16))
      .attr('fill', d => TYPE_COLORS[d.type] || '#94a3b8')
      .attr('stroke', d => TYPE_COLORS[d.type] || '#94a3b8')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.4)
      .attr('fill-opacity', 0.7)
      .attr('filter', 'url(#glow)')
      .style('cursor', 'pointer');

    const dragBehavior = drag<SVGCircleElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x ?? 0;
        d.fy = d.y ?? 0;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(dragBehavior);

    node.on('mouseover', (event, d) => {
      const relatedIds = new Set<string>();
      data.links.forEach(l => {
        if (getNodeId(l.source) === d.id) relatedIds.add(getNodeId(l.target));
        if (getNodeId(l.target) === d.id) relatedIds.add(getNodeId(l.source));
      });
      link
        .attr('stroke-opacity', l => (getNodeId(l.source) === d.id || getNodeId(l.target) === d.id ? 0.8 : 0.05))
        .attr('stroke-width', l => (getNodeId(l.source) === d.id || getNodeId(l.target) === d.id ? 2 : 0.5));
      node.attr('fill-opacity', n => {
        if (n.id === d.id) return 1;
        return relatedIds.has(n.id) ? 0.9 : 0.15;
      });
      buildTooltip(d, relatedIds);
      tooltip.style.left = `${Math.min(event.pageX + 12, width - 380)}px`;
      tooltip.style.top = `${Math.min(event.pageY - 10, height - 200)}px`;
    })
      .on('mouseout', () => {
        link.attr('stroke-opacity', 0.15).attr('stroke-width', 1);
        node.attr('fill-opacity', 0.7);
        tooltip.style.display = 'none';
      })
      .on('click', (_event, d) => {
        const related = data.links
          .filter(l => getNodeId(l.source) === d.id || getNodeId(l.target) === d.id)
          .map(l => (getNodeId(l.source) === d.id ? getNodeId(l.target) : getNodeId(l.source)));
        node.attr('fill-opacity', n => (n.id === d.id || related.includes(n.id) ? 1 : 0.1));
        link.attr('stroke-opacity', l =>
          getNodeId(l.source) === d.id || getNodeId(l.target) === d.id ? 0.8 : 0.02,
        );
      });

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x ?? 0)
        .attr('y1', d => (d.source as GraphNode).y ?? 0)
        .attr('x2', d => (d.target as GraphNode).x ?? 0)
        .attr('y2', d => (d.target as GraphNode).y ?? 0);
      node.attr('cx', d => d.x ?? 0).attr('cy', d => d.y ?? 0);
    });

    const filterDiv = document.getElementById('filters') as HTMLDivElement;
    const types = [...new Set(data.nodes.map(n => n.type))];
    const activeFilters = new Set(types);
    types.forEach(t => {
      const btn = document.createElement('span');
      btn.className = 'filter-btn active';
      btn.textContent = t.replace(/-/g, ' ');
      btn.style.borderColor = TYPE_COLORS[t];
      btn.addEventListener('click', () => {
        if (activeFilters.has(t)) {
          activeFilters.delete(t);
          btn.classList.remove('active');
        } else {
          activeFilters.add(t);
          btn.classList.add('active');
        }
        node.attr('display', d => (activeFilters.has(d.type) ? null : 'none'));
        link.attr('display', l =>
          activeFilters.has((l.source as GraphNode).type) && activeFilters.has((l.target as GraphNode).type)
            ? null
            : 'none',
        );
      });
      filterDiv.appendChild(btn);
    });

    const search = document.getElementById('search') as HTMLInputElement;
    const matches = (n: GraphNode, q: string): boolean =>
      n.name.toLowerCase().includes(q) ||
      n.relPath.toLowerCase().includes(q) ||
      n.type.toLowerCase().includes(q) ||
      n.exports.some(e => e.toLowerCase().includes(q));
    const matchNode = (n: string | GraphNode, q: string): boolean => {
      if (typeof n === 'object') return matches(n, q);
      const node = data.nodes.find(x => x.id === n);
      return node ? matches(node, q) : false;
    };

    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      if (!q) {
        node.attr('fill-opacity', 0.7).attr('display', null);
        link.attr('opacity', null).attr('display', null);
        return;
      }
      node
        .attr('fill-opacity', d => (matches(d, q) ? 1 : 0.08))
        .attr('display', d => (matches(d, q) ? null : 'none'));
      link
        .attr('display', d => (matchNode(d.source, q) || matchNode(d.target, q) ? null : 'none'))
        .attr('opacity', d => (matchNode(d.source, q) || matchNode(d.target, q) ? 0.3 : 0.02));
    });

    const legendDiv = document.getElementById('legend') as HTMLDivElement;
    Object.entries(TYPE_COLORS)
      .filter(([t]) => stats[t])
      .forEach(([t, c]) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        const dot = document.createElement('span');
        dot.className = 'legend-dot';
        dot.style.background = c;
        const label = document.createElement('span');
        label.textContent = `${t.replace(/-/g, ' ')} (${stats[t]})`;
        item.append(dot, label);
        legendDiv.appendChild(item);
      });

    svg.call(zoomBehavior.transform, zoomIdentity.translate(width * 0.1, height * 0.1).scale(0.8));
  })
  .catch(() => {
    const controls = document.querySelector('.controls');
    if (!controls) return;
    const error = document.createElement('div');
    error.className = 'stats';
    error.textContent = 'Could not load /graph/graph.json — run `node scripts/analyze.mjs`.';
    controls.appendChild(error);
  });
