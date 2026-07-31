import React, { useEffect } from 'react';
import { UniverseScene } from './scene/UniverseScene';
import { SceneControls } from './controls/SceneControls';
import { ServicePanel } from './panels/ServicePanel';
import { FlatGraph } from './fallback/FlatGraph';
import { useHubData } from './hooks/useHubData';
import { useAuthMessage } from './hooks/useAuthMessage';
import { useSceneStore } from './store/sceneStore';

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

export default function App() {
  useHubData();
  useAuthMessage();

  const webglOk = useSceneStore((s) => s.webglOk);
  const setWebglOk = useSceneStore((s) => s.setWebglOk);
  const setReducedMotion = useSceneStore((s) => s.setReducedMotion);
  const setParticlesEnabled = useSceneStore((s) => s.setParticlesEnabled);

  useEffect(() => {
    const ok = detectWebGL();
    setWebglOk(ok);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(reduce);
    if (reduce) setParticlesEnabled(false);
  }, [setWebglOk, setReducedMotion, setParticlesEnabled]);

  // Keyboard: Tab cycles nodes, Space selects, Escape clears
  useEffect(() => {
    const ids = () => Object.keys(useSceneStore.getState().nodes);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useSceneStore.getState().setSelectedNode(null);
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const list = ids();
        if (!list.length) return;
        const cur = useSceneStore.getState().selectedNode;
        const idx = cur ? list.indexOf(cur) : -1;
        const next = list[(idx + 1) % list.length];
        useSceneStore.getState().setSelectedNode(next);
        const pos = useSceneStore.getState().nodes[next]?.position;
        if (pos) useSceneStore.getState().setCameraTarget(pos);
      }
      if (e.key === ' ' || e.key === 'Enter') {
        const cur = useSceneStore.getState().selectedNode;
        if (cur) {
          const pos = useSceneStore.getState().nodes[cur]?.position;
          if (pos) useSceneStore.getState().setCameraTarget(pos);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="immersive-root">
      <SceneControls />
      <div className="immersive-stage">{webglOk ? <UniverseScene /> : <FlatGraph />}</div>
      <ServicePanel />
    </div>
  );
}
