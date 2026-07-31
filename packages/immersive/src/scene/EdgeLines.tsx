import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { IMMERSIVE_EDGES, IMMERSIVE_SERVICES } from '../config/services';
import { useSceneStore } from '../store/sceneStore';

type EdgeItem = {
  a: string;
  b: string;
  line: Line2;
  geo: LineGeometry;
  mat: LineMaterial;
  phase: number;
};

/** Line2 thick edges — pulse opacity/dash with live traffic (zero React setState). */
export function EdgeLines() {
  const group = useRef<THREE.Group>(null);
  const { size } = useThree();
  const nodes = useSceneStore((s) => s.nodes);
  const traffic = useSceneStore((s) => s.traffic);
  const filters = useSceneStore((s) => s.filters);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);

  const edges = useMemo<EdgeItem[]>(() => {
    return IMMERSIVE_EDGES.map(([a, b]) => {
      const geo = new LineGeometry();
      geo.setPositions([0, 0, 0, 0, 0, 0]);
      const mat = new LineMaterial({
        color: 0x64748b,
        linewidth: 1.5,
        transparent: true,
        opacity: 0.45,
        dashed: false,
        dashScale: 1,
        dashSize: 0.4,
        gapSize: 0.2,
      });
      mat.resolution.set(size.width, size.height);
      const line = new Line2(geo, mat);
      line.computeLineDistances();
      return { a, b, line, geo, mat, phase: Math.random() * Math.PI * 2 };
    });
    // size applied in useFrame / effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    for (const e of edges) {
      e.mat.resolution.set(size.width, size.height);
    }
  }, [edges, size.width, size.height]);

  useEffect(() => {
    return () => {
      for (const e of edges) {
        e.geo.dispose();
        e.mat.dispose();
      }
    };
  }, [edges]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (const item of edges) {
      const na = nodes[item.a];
      const nb = nodes[item.b];
      const ma = IMMERSIVE_SERVICES.find((s) => s.id === item.a);
      const mb = IMMERSIVE_SERVICES.find((s) => s.id === item.b);
      if (!na || !nb || !ma || !mb || !filters[ma.category] || !filters[mb.category]) {
        item.line.visible = false;
        continue;
      }
      item.line.visible = true;
      item.geo.setPositions([
        na.position[0],
        na.position[1],
        na.position[2],
        nb.position[0],
        nb.position[1],
        nb.position[2],
      ]);
      item.line.computeLineDistances();

      const key = [item.a, item.b].sort().join('::');
      const trav = traffic[key] ?? 0;
      const pulse = reducedMotion ? 0.4 : 0.35 + Math.sin(t * 3 + item.phase) * 0.2;
      item.mat.opacity = Math.min(0.95, 0.25 + trav * 0.05 + pulse * 0.3);
      item.mat.linewidth = 1.2 + Math.min(2.8, trav * 0.15);
      item.mat.color.set(trav > 8 ? '#38bdf8' : trav > 3 ? '#94a3b8' : '#475569');
      item.mat.dashed = trav > 5 && !reducedMotion;
      if (item.mat.dashed) {
        item.mat.dashOffset = -t * (0.8 + trav * 0.05);
      }
      item.mat.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      {edges.map((e) => (
        <primitive key={`${e.a}-${e.b}`} object={e.line} />
      ))}
    </group>
  );
}
