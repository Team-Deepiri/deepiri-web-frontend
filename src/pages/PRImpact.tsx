import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, AlertTriangle, CheckCircle, ArrowRight, TrendingUp, Layers } from 'lucide-react';
import { TYPE_COLORS } from '../utils/graphConstants';
import '../styles/pr-impact.css';

interface GraphNode {
  id: string;
  name: string;
  type: string;
  relPath: string;
  exports: string[];
  lines: number;
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

const PRImpact: React.FC = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/graph/graph.json').then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const impact = useMemo(() => {
    if (!data || selectedFiles.size === 0) return null;

    const nodeMap: Record<string, GraphNode> = {};
    data.nodes.forEach(n => nodeMap[n.id] = n);

    const directlyAffected = new Set<string>(selectedFiles);
    const indirectlyAffected = new Set<string>();
    const affectedTypes: Record<string, number> = {};
    let riskScore = 0;

    const adjacency: Record<string, string[]> = {};
    for (const link of data.links) {
      const src = typeof link.source === 'object' ? link.source.id : link.source;
      const tgt = typeof link.target === 'object' ? link.target.id : link.target;
      if (!adjacency[src]) adjacency[src] = [];
      if (!adjacency[tgt]) adjacency[tgt] = [];
      adjacency[src].push(tgt);
      adjacency[tgt].push(src);
    }

    for (const fileId of selectedFiles) {
      const neighbors = adjacency[fileId] || [];
      const queue = [...neighbors];
      const visited = new Set<string>(neighbors);

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (!directlyAffected.has(current)) {
          indirectlyAffected.add(current);
        }
        for (const next of (adjacency[current] || [])) {
          if (!visited.has(next) && !directlyAffected.has(next)) {
            visited.add(next);
            queue.push(next);
          }
        }
      }

      const node = nodeMap[fileId];
      if (node) {
        affectedTypes[node.type] = (affectedTypes[node.type] || 0) + 1;
        riskScore += neighbors.length * 10;
        if (node.type === 'context') riskScore += 50;
        if (node.type === 'api-module') riskScore += 30;
        if (node.type === 'hook') riskScore += 20;
      }
    }

    indirectlyAffected.forEach(dep => {
      const node = nodeMap[dep];
      if (node) {
        affectedTypes[node.type] = (affectedTypes[node.type] || 0) + 1;
      }
    });

    const validIndirectlyAffected = [...indirectlyAffected].filter(id => nodeMap[id]);
    const allAffected = new Set([...directlyAffected, ...validIndirectlyAffected]);
    const riskLevel = riskScore > 100 ? 'high' : riskScore > 40 ? 'medium' : 'low';

    return {
      directlyAffected: [...directlyAffected],
      indirectlyAffected: validIndirectlyAffected,
      totalAffected: allAffected.size,
      affectedTypes,
      riskScore: Math.min(riskScore, 200),
      riskLevel,
    };
  }, [data, selectedFiles]);

  const filteredFiles = useMemo(() => {
    if (!data) return [];
    const q = searchQuery.toLowerCase();
    return data.nodes
      .filter(n => !q || n.name.toLowerCase().includes(q) || n.relPath.toLowerCase().includes(q) || n.type.toLowerCase().includes(q))
      .sort((a, b) => b.lines - a.lines);
  }, [data, searchQuery]);

  const toggleFile = (id: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!data) {
    return (
      <div className="pri-loading">
        <GitBranch size={48} />
        <p>Loading graph data...</p>
      </div>
    );
  }

  return (
    <div className="pri-container">
      <div className="pri-sidebar">
        <div className="pri-sidebar-header">
          <GitBranch size={20} />
          <h2>PR Impact Analysis</h2>
        </div>

        <div className="pri-search">
          <input
            type="text"
            placeholder="Find files to change..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="pri-file-list">
          {filteredFiles.map(n => (
            <label key={n.id} className={`pri-file-item ${selectedFiles.has(n.id) ? 'selected' : ''}`}>
              <input
                type="checkbox"
                checked={selectedFiles.has(n.id)}
                onChange={() => toggleFile(n.id)}
              />
              <span className="pri-file-check" />
              <div className="pri-file-info">
                <span className="pri-file-name">{n.name}</span>
                <span className="pri-file-path">{n.relPath}</span>
              </div>
              <span className="pri-file-type" style={{ color: TYPE_COLORS[n.type] }}>
                {n.type.replace(/-/g, ' ')}
              </span>
            </label>
          ))}
        </div>

        <div className="pri-selected-count">
          {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
        </div>
      </div>

      <div className="pri-main">
        {impact ? (
          <motion.div
            className="pri-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="pri-risk-card" data-risk={impact.riskLevel}>
              <div className="pri-risk-header">
                <div className="pri-risk-badge">
                  {impact.riskLevel === 'high' ? <AlertTriangle size={24} /> :
                   impact.riskLevel === 'medium' ? <TrendingUp size={24} /> :
                   <CheckCircle size={24} />}
                  <div>
                    <h3>Risk: {impact.riskLevel.toUpperCase()}</h3>
                    <p>Score: {impact.riskScore}/200</p>
                  </div>
                </div>
                <div className="pri-risk-meter">
                  <div className="pri-risk-bar" style={{ width: `${impact.riskScore / 2}%` }} />
                </div>
              </div>

              <div className="pri-impact-stats">
                <div className="pri-impact-stat">
                  <span className="pri-impact-value">{impact.directlyAffected.length}</span>
                  <span className="pri-impact-label">Direct Changes</span>
                </div>
                <div className="pri-impact-stat">
                  <span className="pri-impact-value">{impact.indirectlyAffected.length}</span>
                  <span className="pri-impact-label">Indirectly Affected</span>
                </div>
                <div className="pri-impact-stat">
                  <span className="pri-impact-value">{impact.totalAffected}</span>
                  <span className="pri-impact-label">Total Impact</span>
                </div>
                <div className="pri-impact-stat">
                  <span className="pri-impact-value">{data.nodes.length}</span>
                  <span className="pri-impact-label">Codebase Files</span>
                </div>
              </div>
            </div>

            <div className="pri-section">
              <h3><Layers size={16} /> Affected by Type</h3>
              <div className="pri-type-bars">
                {Object.entries(impact.affectedTypes)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="pri-type-bar">
                      <div className="pri-type-bar-header">
                        <span className="pri-type-dot" style={{ background: TYPE_COLORS[type] }} />
                        <span>{type.replace(/-/g, ' ')}</span>
                        <span className="pri-type-count">{count}</span>
                      </div>
                      <div className="pri-type-bar-track">
                        <div
                          className="pri-type-bar-fill"
                          style={{ width: `${(count / impact.totalAffected) * 100}%`, background: TYPE_COLORS[type] }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pri-section">
              <h3><ArrowRight size={16} /> Blast Radius</h3>
              <div className="pri-blast-list">
                {impact.indirectlyAffected.map(id => {
                  const node = data.nodes.find(n => n.id === id);
                  if (!node) return null;
                  return (
                    <div key={id} className="pri-blast-item">
                      <span className="pri-blast-dot" style={{ background: TYPE_COLORS[node.type] }} />
                      <div>
                        <span className="pri-blast-name">{node.name}</span>
                        <span className="pri-blast-path">{node.relPath}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="pri-empty">
            <GitBranch size={64} strokeWidth={1} />
            <h2>Select files to analyze impact</h2>
            <p>Check files on the left to see what would be affected by changes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PRImpact;
