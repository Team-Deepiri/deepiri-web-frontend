import React from 'react';
import { IMMERSIVE_SERVICES } from '../config/services';
import { useSceneStore } from '../store/sceneStore';
import { PORTAL_URL } from '../config/services';

export function ServicePanel() {
  const selectedNode = useSceneStore((s) => s.selectedNode);
  const node = useSceneStore((s) => (selectedNode ? s.nodes[selectedNode] : null));
  const setSelectedNode = useSceneStore((s) => s.setSelectedNode);
  const meta = IMMERSIVE_SERVICES.find((s) => s.id === selectedNode);

  if (!selectedNode || !node || !meta) return null;

  return (
    <aside className="svc-panel" aria-label="Service detail">
      <button type="button" className="svc-panel-close" onClick={() => setSelectedNode(null)}>
        Close
      </button>
      <h2>{meta.name}</h2>
      <p className="svc-panel-id">{meta.id}</p>
      <dl>
        <div>
          <dt>Category</dt>
          <dd>{meta.category}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd className={`band-${node.healthBand}`}>{node.status}</dd>
        </div>
        <div>
          <dt>Health</dt>
          <dd className={`band-${node.healthBand}`}>{node.healthBand}</dd>
        </div>
        <div>
          <dt>Latency</dt>
          <dd>{node.latencyMs ?? '—'} ms</dd>
        </div>
        <div>
          <dt>Connections</dt>
          <dd>{node.connections}</dd>
        </div>
        {meta.port != null && (
          <div>
            <dt>Port</dt>
            <dd>{meta.port}</dd>
          </div>
        )}
      </dl>
      <a className="svc-panel-link" href={PORTAL_URL}>
        Open in Portal
      </a>
    </aside>
  );
}
