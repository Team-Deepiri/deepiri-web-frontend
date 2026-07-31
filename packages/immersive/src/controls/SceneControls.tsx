import React from 'react';
import type { ServiceCategory } from '../config/services';
import { PORTAL_URL } from '../config/services';
import { useSceneStore } from '../store/sceneStore';

const CATS: ServiceCategory[] = ['platform', 'ai', 'comms', 'infra', 'tooling'];

export function SceneControls() {
  const filters = useSceneStore((s) => s.filters);
  const setFilter = useSceneStore((s) => s.setFilter);
  const particlesEnabled = useSceneStore((s) => s.particlesEnabled);
  const setParticlesEnabled = useSceneStore((s) => s.setParticlesEnabled);
  const constellationMode = useSceneStore((s) => s.constellationMode);
  const setConstellationMode = useSceneStore((s) => s.setConstellationMode);
  const hubConnected = useSceneStore((s) => s.hubConnected);
  const webglOk = useSceneStore((s) => s.webglOk);
  const setWebglOk = useSceneStore((s) => s.setWebglOk);
  const setSelectedNode = useSceneStore((s) => s.setSelectedNode);
  const setCameraTarget = useSceneStore((s) => s.setCameraTarget);
  const targetFps = useSceneStore((s) => s.targetFps);
  const quality = useSceneStore((s) => s.quality);
  const token = useSceneStore((s) => s.token);

  return (
    <div className="scene-hud">
      <a className="back-portal" href={PORTAL_URL}>
        ← Back to Portal
      </a>

      <div className="scene-status">
        <span className={hubConnected ? 'is-live' : 'is-down'}>
          Hub {hubConnected ? 'live' : 'offline'}
        </span>
        <span>{webglOk ? 'WebGL' : '2D fallback'}</span>
        <span title="Adaptive render target">{targetFps}fps · {quality}</span>
        {token ? <span className="is-live">auth ✓</span> : null}
      </div>

      <div className="scene-controls" role="toolbar" aria-label="Scene controls">
        {CATS.map((c) => (
          <label key={c} className="scene-chip">
            <input
              type="checkbox"
              checked={filters[c]}
              onChange={(e) => setFilter(c, e.target.checked)}
            />
            {c}
          </label>
        ))}
        <label className="scene-chip">
          <input
            type="checkbox"
            checked={particlesEnabled}
            onChange={(e) => setParticlesEnabled(e.target.checked)}
          />
          particles
        </label>
        <label className="scene-chip">
          <input
            type="checkbox"
            checked={constellationMode}
            onChange={(e) => setConstellationMode(e.target.checked)}
          />
          constellation
        </label>
        <button
          type="button"
          className="scene-chip btn"
          onClick={() => {
            setSelectedNode(null);
            setCameraTarget(null);
          }}
        >
          reset camera
        </button>
        <button
          type="button"
          className="scene-chip btn"
          onClick={() => setWebglOk(!webglOk)}
        >
          {webglOk ? '2D mode' : '3D mode'}
        </button>
      </div>
    </div>
  );
}
