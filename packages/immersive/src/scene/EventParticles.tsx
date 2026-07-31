import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { colorMap, errorColor } from '@deepiri/shared/utils/colorMap';
import { useSceneStore, type ImmersiveEvent } from '../store/sceneStore';

type Particle = {
  active: boolean;
  t: number;
  speed: number;
  curve: THREE.CatmullRomCurve3 | null;
  color: THREE.Color;
  size: number;
};

const POOL = 120;

export function EventParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const pool = useRef<Particle[]>([]);
  const positions = useRef(new Float32Array(POOL * 3));
  const colors = useRef(new Float32Array(POOL * 3));
  const sizes = useRef(new Float32Array(POOL));

  const particlesEnabled = useSceneStore((s) => s.particlesEnabled);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const consumeEvents = useSceneStore((s) => s.consumeEvents);
  const nodes = useSceneStore((s) => s.nodes);

  useEffect(() => {
    pool.current = Array.from({ length: POOL }, () => ({
      active: false,
      t: 0,
      speed: 0.35,
      curve: null,
      color: new THREE.Color('#fff'),
      size: 1,
    }));
  }, []);

  const spawn = (ev: ImmersiveEvent) => {
    const from = nodes[ev.fromId]?.position;
    const to = nodes[ev.toId]?.position;
    if (!from || !to) return;
    const slot = pool.current.find((p) => !p.active);
    if (!slot) return;

    const mid: [number, number, number] = [
      (from[0] + to[0]) / 2 + (Math.random() - 0.5) * 1.5,
      (from[1] + to[1]) / 2 + 1.2 + Math.random(),
      (from[2] + to[2]) / 2 + (Math.random() - 0.5) * 1.5,
    ];
    slot.curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...from),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...to),
    ]);
    slot.active = true;
    slot.t = 0;
    slot.speed = ev.error ? 0.7 : 0.35; // errors: 2× speed
    slot.size = ev.error ? 1.5 : 1;
    const hex = ev.error ? errorColor : colorMap[ev.producer] ?? '#38bdf8';
    slot.color = new THREE.Color(hex);
  };

  useFrame((_, dt) => {
    if (!particlesEnabled || reducedMotion) {
      // keep particles hidden
      for (let i = 0; i < POOL; i++) {
        positions.current[i * 3 + 1] = -999;
        pool.current[i].active = false;
      }
    } else {
      for (const ev of consumeEvents()) spawn(ev);

      for (let i = 0; i < POOL; i++) {
        const p = pool.current[i];
        if (!p?.active || !p.curve) {
          positions.current[i * 3 + 1] = -999;
          continue;
        }
        p.t += dt * p.speed;
        if (p.t >= 1) {
          p.active = false;
          positions.current[i * 3 + 1] = -999;
          continue;
        }
        const pt = p.curve.getPoint(p.t);
        positions.current[i * 3] = pt.x;
        positions.current[i * 3 + 1] = pt.y;
        positions.current[i * 3 + 2] = pt.z;
        colors.current[i * 3] = p.color.r;
        colors.current[i * 3 + 1] = p.color.g;
        colors.current[i * 3 + 2] = p.color.b;
        sizes.current[i] = p.size;
      }
    }

    const geo = pointsRef.current?.geometry;
    if (geo) {
      const pos = geo.getAttribute('position') as THREE.BufferAttribute;
      const col = geo.getAttribute('color') as THREE.BufferAttribute;
      pos.needsUpdate = true;
      col.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors.current, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
