import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { IMMERSIVE_EDGES, IMMERSIVE_SERVICES } from '../config/services';
import { useSceneStore } from '../store/sceneStore';

export function EdgeLines() {
  const group = useRef<THREE.Group>(null);
  const nodes = useSceneStore((s) => s.nodes);
  const traffic = useSceneStore((s) => s.traffic);
  const filters = useSceneStore((s) => s.filters);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);

  const lines = useMemo(() => {
    return IMMERSIVE_EDGES.map(([a, b]) => {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(6);
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color('#64748b'),
        transparent: true,
        opacity: 0.45,
      });
      const line = new THREE.Line(geo, mat);
      return { a, b, line, geo, mat, positions, phase: Math.random() * Math.PI * 2 };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (const item of lines) {
      const na = nodes[item.a];
      const nb = nodes[item.b];
      const ma = IMMERSIVE_SERVICES.find((s) => s.id === item.a);
      const mb = IMMERSIVE_SERVICES.find((s) => s.id === item.b);
      if (!na || !nb || !ma || !mb) {
        item.line.visible = false;
        continue;
      }
      if (!filters[ma.category] || !filters[mb.category]) {
        item.line.visible = false;
        continue;
      }
      item.line.visible = true;
      item.positions[0] = na.position[0];
      item.positions[1] = na.position[1];
      item.positions[2] = na.position[2];
      item.positions[3] = nb.position[0];
      item.positions[4] = nb.position[1];
      item.positions[5] = nb.position[2];
      item.geo.attributes.position.needsUpdate = true;

      const key = [item.a, item.b].sort().join('::');
      const trav = traffic[key] ?? 0;
      const pulse = reducedMotion ? 0.4 : 0.35 + Math.sin(t * 3 + item.phase) * 0.2;
      item.mat.opacity = Math.min(0.9, 0.25 + trav * 0.05 + pulse * 0.25);
      item.mat.color.set(trav > 8 ? '#38bdf8' : '#64748b');
    }
  });

  return (
    <group ref={group}>
      {lines.map((l) => (
        <primitive key={`${l.a}-${l.b}`} object={l.line} />
      ))}
    </group>
  );
}
