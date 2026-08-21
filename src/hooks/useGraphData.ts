import { useState, useEffect } from 'react';

export interface GraphNode {
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

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  meta: { analyzedAt: string; fileCount: number };
}

export function useGraphData() {
  const [data, setData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/graph/graph.json')
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load graph: ${r.status}`);
        return r.json();
      })
      .then((d: GraphData) => {
        setData(d);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return { data, isLoading, error };
}
