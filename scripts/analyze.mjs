#!/usr/bin/env node

/**
 * Codebase Analyzer
 * ==================
 *
 * Parses all .ts/.tsx/.js/.jsx files under src/ and produces three artifacts:
 *
 * 1. public/graph/graph.json
 *    Queryable graph data for the React CodebaseGraph page and PRImpact dashboard.
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
 * 2. public/graph/index.html
 *    Standalone interactive D3 visualization. Search highlights matching nodes and
 *    dims non-matching ones (opacity 0.08). Links connected to matches are shown.
 *
 * 3. public/graph/REPORT.md
 *    Full Markdown report listing every file, its type, exports, dependencies,
 *    and relationship counts.
 *
 * Usage:
 *   node scripts/analyze.mjs
 *
 * Dependencies: None (pure Node.js, uses D3 only in the generated HTML).
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

const graphData = { nodes, links: deduped, meta: { analyzedAt: new Date().toISOString(), fileCount: allFiles.length } };

writeFileSync(join(OUT, 'graph.json'), JSON.stringify(graphData, null, 2));
console.log(`Graph: ${nodes.length} nodes, ${deduped.length} links`);

const typeColors = {
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

function generateHTML(data) {
  const nodeMap = {};
  data.nodes.forEach(n => nodeMap[n.id] = n);

  const stats = {};
  data.nodes.forEach(n => { stats[n.type] = (stats[n.type] || 0) + 1; });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Deepiri Codebase Intelligence</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0b1020;color:#e2e8f0;font-family:'Inter',-apple-system,sans-serif;overflow:hidden}
#graph{width:100vw;height:100vh}
.controls{position:fixed;top:16px;left:16px;background:rgba(15,23,42,0.92);backdrop-filter:blur(16px);border:1px solid rgba(99,102,241,0.2);border-radius:16px;padding:20px;z-index:100;width:300px}
.controls h1{font-size:16px;margin-bottom:12px;background:linear-gradient(135deg,#6366f1,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.controls input{width:100%;padding:8px 12px;background:rgba(30,41,59,0.8);border:1px solid rgba(99,102,241,0.2);border-radius:8px;color:#e2e8f0;font-size:13px;margin-bottom:8px}
.controls input:focus{outline:none;border-color:#6366f1}
.filter-btn{display:inline-block;padding:4px 10px;margin:2px;border-radius:6px;font-size:11px;border:1px solid rgba(255,255,255,0.1);background:rgba(30,41,59,0.6);color:#94a3b8;cursor:pointer;transition:all .2s}
.filter-btn:hover,.filter-btn.active{background:rgba(99,102,241,0.2);border-color:#6366f1;color:#c7d2fe}
.stats{margin-top:12px;font-size:11px;color:#64748b}
.stats span{color:#818cf8;font-weight:600}
.tooltip{position:fixed;pointer-events:none;background:rgba(15,23,42,0.95);backdrop-filter:blur(12px);border:1px solid rgba(99,102,241,0.3);border-radius:12px;padding:16px;max-width:360px;z-index:200;font-size:12px;display:none}
.tooltip h3{font-size:14px;margin-bottom:6px;color:#c7d2fe}
.tooltip .path{color:#64748b;font-size:11px;margin-bottom:8px;word-break:break-all}
.tooltip .tag{display:inline-block;padding:2px 8px;margin:2px;border-radius:4px;font-size:10px}
.legend{position:fixed;bottom:16px;left:16px;background:rgba(15,23,42,0.92);backdrop-filter:blur(16px);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:16px;z-index:100}
.legend-item{display:flex;align-items:center;gap:8px;margin:4px 0;font-size:11px;color:#94a3b8}
.legend-dot{width:10px;height:10px;border-radius:50%}
svg text{font-family:'Inter',sans-serif}
</style>
</head>
<body>
<div class="controls">
  <h1>Deepiri Codebase Intelligence</h1>
  <input type="text" id="search" placeholder="Search files, components, hooks...">
  <div id="filters"></div>
  <div class="stats">Analyzing <span>${data.nodes.length}</span> files across <span>${Object.keys(stats).length}</span> categories<br><span>${data.links.length}</span> relationships mapped<br>Generated <span>${new Date(data.meta.analyzedAt).toLocaleString()}</span></div>
</div>
<div class="legend" id="legend"></div>
<div class="tooltip" id="tooltip"></div>
<svg id="graph"></svg>
<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
const graphData = ${JSON.stringify(data)};
const stats = {};
graphData.nodes.forEach(n => { stats[n.type] = (stats[n.type] || 0) + 1; });
const typeColors = ${JSON.stringify(typeColors)};
const tooltip = document.getElementById('tooltip');
const svg = d3.select('#graph');
const width = window.innerWidth;
const height = window.innerHeight;
svg.attr('width', width).attr('height', height);

const defs = svg.append('defs');
const glow = defs.append('filter').attr('id','glow');
glow.append('feGaussianBlur').attr('stdDeviation','3').attr('result','coloredBlur');
const feMerge = glow.append('feMerge');
feMerge.append('feMergeNode').attr('in','coloredBlur');
feMerge.append('feMergeNode').attr('in','SourceGraphic');

const g = svg.append('g');
const zoom = d3.zoom().scaleExtent([0.1, 4]).on('zoom', e => g.attr('transform', e.transform));
svg.call(zoom);

const linkGroup = g.append('g').attr('class','links');
const nodeGroup = g.append('g').attr('class','nodes');

const simulation = d3.forceSimulation(graphData.nodes)
  .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(80).strength(0.3))
  .force('charge', d3.forceManyBody().strength(-200))
  .force('center', d3.forceCenter(width/2, height/2))
  .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.lines || 10) + 8))
  .force('x', d3.forceX(width/2).strength(0.05))
  .force('y', d3.forceY(height/2).strength(0.05));

const link = linkGroup.selectAll('line').data(graphData.links).join('line')
  .attr('stroke', d => d.type === 'imports' ? 'rgba(99,102,241,0.15)' : 'rgba(249,115,22,0.1)')
  .attr('stroke-width', 1);

const node = nodeGroup.selectAll('circle').data(graphData.nodes).join('circle')
  .attr('r', d => Math.min(Math.sqrt(d.lines || 10) + 3, 16))
  .attr('fill', d => typeColors[d.type] || '#94a3b8')
  .attr('stroke', d => typeColors[d.type] || '#94a3b8')
  .attr('stroke-width', 1.5)
  .attr('stroke-opacity', 0.4)
  .attr('fill-opacity', 0.7)
  .attr('filter', 'url(#glow)')
  .style('cursor', 'pointer')
  .call(d3.drag().on('start', dragStart).on('drag', dragging).on('end', dragEnd));

node.on('mouseover', (e, d) => {
  link.attr('stroke-opacity', l => (l.source&&l.source.id===d.id)||(l.target&&l.target.id===d.id)?0.8:0.05)
      .attr('stroke-width', l => (l.source&&l.source.id===d.id)||(l.target&&l.target.id===d.id)?2:0.5);
  node.attr('fill-opacity', n => {
    if (n.id===d.id) return 1;
    return graphData.links.some(l => (l.source&&l.target&&l.source.id===d.id&&l.target.id===n.id)||(l.target&&l.source&&l.target.id===d.id&&l.source.id===n.id)) ? 0.9 : 0.15;
  });
  const tagColor = typeColors[d.type]||'#94a3b8';
  tooltip.innerHTML = '<h3>'+d.name+'</h3><div class="path">'+d.relPath+'</div>'
    +'<span class="tag" style="background:'+tagColor+'22;color:'+tagColor+';border:1px solid '+tagColor+'44">'+d.type+'</span> '
    +'<span class="tag" style="background:rgba(30,41,59,0.8);color:#94a3b8">'+d.lines+' lines</span><br>'
    +(d.exports.length?'<div style="margin-top:6px;color:#64748b">exports: '+d.exports.join(', ')+'</div>':'')
    +(d.hooksUsed.length?'<div style="margin-top:4px;color:#f59e0b">hooks: '+d.hooksUsed.join(', ')+'</div>':'')
    +(d.componentsUsed.length?'<div style="margin-top:4px;color:#8b5cf6">components: '+d.componentsUsed.join(', ')+'</div>':'')
    +(d.externalDeps.length?'<div style="margin-top:4px;color:#10b981">packages: '+d.externalDeps.join(', ')+'</div>':'');
  tooltip.style.display = 'block';
  tooltip.style.left = Math.min(e.pageX+12, width-380)+'px';
  tooltip.style.top = Math.min(e.pageY-10, height-200)+'px';
}).on('mouseout', () => {
  link.attr('stroke-opacity', 0.15).attr('stroke-width', 1);
  node.attr('fill-opacity', 0.7);
  tooltip.style.display = 'none';
}).on('click', (e, d) => {
  const related = graphData.links.filter(l=>(l.source&&l.source.id===d.id)||(l.target&&l.target.id===d.id)).map(l=>(l.source&&l.source.id===d.id)?(l.target&&l.target.id):l.source.id);
  node.attr('fill-opacity', n => n.id===d.id||related.includes(n.id)?1:0.1);
  link.attr('stroke-opacity', l => (l.source&&l.source.id===d.id)||(l.target&&l.target.id===d.id)?0.8:0.02);
});

simulation.on('tick', () => {
  link.attr('x1',d=>d.source?d.source.x:0).attr('y1',d=>d.source?d.source.y:0).attr('x2',d=>d.target?d.target.x:0).attr('y2',d=>d.target?d.target.y:0);
  node.attr('cx',d=>d.x).attr('cy',d=>d.y);
});

function dragStart(e,d){if(!e.active)simulation.alphaTarget(0.3).restart();d.fx=d.x;d.fy=d.y}
function dragging(e,d){d.fx=e.x;d.fy=e.y}
function dragEnd(e,d){if(!e.active)simulation.alphaTarget(0);d.fx=null;d.fy=null}

const filterDiv = document.getElementById('filters');
const types = [...new Set(graphData.nodes.map(n=>n.type))];
const activeFilters = new Set(types);
types.forEach(t => {
  const btn = document.createElement('span');
  btn.className = 'filter-btn active';
  btn.textContent = t.replace(/-/g,' ');
  btn.style.borderColor = typeColors[t];
  btn.onclick = () => {
    if (activeFilters.has(t)) { activeFilters.delete(t); btn.classList.remove('active'); }
    else { activeFilters.add(t); btn.classList.add('active'); }
    node.attr('display', d => activeFilters.has(d.type) ? null : 'none');
    link.attr('display', l => (l.source&&activeFilters.has(l.source.type))&&(l.target&&activeFilters.has(l.target.type)) ? null : 'none');
  };
  filterDiv.appendChild(btn);
});

document.getElementById('search').addEventListener('input', function() {
  const q = this.value.toLowerCase();
  if (!q) { node.attr('fill-opacity',0.7).attr('display',null); link.attr('opacity',null).attr('display',null); return; }
  node.attr('fill-opacity', d => {
    const match = d.name.toLowerCase().includes(q)||d.relPath.toLowerCase().includes(q)||d.type.toLowerCase().includes(q)||d.exports.some(e=>e.toLowerCase().includes(q));
    return match ? 1 : 0.08;
  }).attr('display', d => {
    const match = d.name.toLowerCase().includes(q)||d.relPath.toLowerCase().includes(q)||d.type.toLowerCase().includes(q)||d.exports.some(e=>e.toLowerCase().includes(q));
    return match ? null : 'none';
  });
  const matchNode = n => n && ((n.name||'').toLowerCase().includes(q)||(n.relPath||'').toLowerCase().includes(q)||(n.type||'').toLowerCase().includes(q)||(n.exports||[]).some(e=>e.toLowerCase().includes(q)));
  link.attr('display', d => {
    return (matchNode(d.source)||matchNode(d.target)) ? null : 'none';
  }).attr('opacity', d => {
    return (matchNode(d.source)||matchNode(d.target)) ? 0.3 : 0.02;
  });
});

const legendDiv = document.getElementById('legend');
Object.entries(typeColors).filter(([t])=>stats[t]).forEach(([t,c]) => {
  legendDiv.innerHTML += '<div class="legend-item"><span class="legend-dot" style="background:'+c+'"></span>'+t.replace(/-/g,' ')+' ('+stats[t]+')</div>';
});

svg.call(zoom.transform, d3.zoomIdentity.translate(width*0.1, height*0.1).scale(0.8));
</script>
</body>
</html>`;
}

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

console.log('Generating HTML export...');
const html = generateHTML(graphData);
writeFileSync(join(OUT, 'index.html'), html);
console.log('HTML exported to public/graph/index.html');

console.log('Generating Markdown report...');
const markdown = generateMarkdown(graphData);
writeFileSync(join(OUT, 'REPORT.md'), markdown);
console.log('Report exported to public/graph/REPORT.md');

console.log('\n=== Analysis Complete ===');
console.log(`Files: ${graphData.nodes.length}`);
console.log(`Relationships: ${graphData.links.length}`);
console.log(`Outputs:`);
console.log(`  - public/graph/graph.json  (queryable graph data)`);
console.log(`  - public/graph/index.html  (interactive visualization)`);
console.log(`  - public/graph/REPORT.md   (Markdown report)`);
