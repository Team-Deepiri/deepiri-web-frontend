import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import { IMMERSIVE_SERVICES } from '../config/services';
import { useSceneStore, type HealthBand } from '../store/sceneStore';

const BAND_COLOR: Record<HealthBand, string> = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
};

/** Single draw-call spheres (doc: instancedMesh) + per-node labels/tooltips. */
export function ServiceNodes() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const nodes = useSceneStore((s) => s.nodes);
  const filters = useSceneStore((s) => s.filters);
  const selectedNode = useSceneStore((s) => s.selectedNode);
  const setSelectedNode = useSceneStore((s) => s.setSelectedNode);
  const setCameraTarget = useSceneStore((s) => s.setCameraTarget);
  const setHoveredNode = useSceneStore((s) => s.setHoveredNode);
  const hoveredNode = useSceneStore((s) => s.hoveredNode);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);

  const [tip, setTip] = useState<{ id: string; pos: [number, number, number] } | null>(null);

  const ordered = useMemo(() => IMMERSIVE_SERVICES.map((s) => s.id), []);

  React.useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < ordered.length; i++) {
      color.set('#22c55e');
      mesh.setColorAt(i, color);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [ordered, color]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;

    ordered.forEach((id, i) => {
      const node = nodes[id];
      const meta = IMMERSIVE_SERVICES[i];
      if (!node || !meta || !filters[meta.category]) {
        dummy.scale.setScalar(0);
        dummy.position.set(0, -999, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        return;
      }

      const radius = 0.28 + Math.min(0.55, node.connections * 0.08);
      const pulse = reducedMotion ? 1 : 1 + Math.sin(t * 2 + i) * 0.03;
      dummy.position.set(...node.position);
      dummy.scale.setScalar(radius * pulse);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      color.set(BAND_COLOR[node.healthBand]);
      mesh.setColorAt(i, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // Selection ring
    if (ringRef.current && selectedNode && nodes[selectedNode]) {
      const n = nodes[selectedNode];
      const r = 0.28 + Math.min(0.55, n.connections * 0.08);
      ringRef.current.visible = true;
      ringRef.current.position.set(...n.position);
      ringRef.current.scale.setScalar(r * 1.45);
      ringRef.current.rotation.x = Math.PI / 2;
    } else if (ringRef.current) {
      ringRef.current.visible = false;
    }
  });

  const onPointer = (e: ThreeEvent<PointerEvent> | ThreeEvent<MouseEvent>, kind: 'over' | 'out' | 'click') => {
    e.stopPropagation();
    const id = ordered[e.instanceId ?? -1];
    if (!id) return;
    const node = nodes[id];
    if (!node) return;

    if (kind === 'over') {
      document.body.style.cursor = 'pointer';
      setHoveredNode(id);
      setTip({ id, pos: [...node.position] as [number, number, number] });
    } else if (kind === 'out') {
      document.body.style.cursor = 'default';
      setHoveredNode(null);
      setTip(null);
    } else {
      setSelectedNode(id);
      setCameraTarget(node.position);
    }
  };

  const tipMeta = tip ? IMMERSIVE_SERVICES.find((s) => s.id === tip.id) : null;
  const tipNode = tip ? nodes[tip.id] : null;

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, ordered.length]}
        onPointerOver={(e) => onPointer(e, 'over')}
        onPointerOut={(e) => onPointer(e, 'out')}
        onClick={(e) => onPointer(e, 'click')}
      >
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial roughness={0.35} metalness={0.1} toneMapped={false} />
      </instancedMesh>

      <mesh ref={ringRef} visible={false}>
        <torusGeometry args={[1, 0.04, 8, 48]} />
        <meshBasicMaterial color="#e2e8f0" transparent opacity={0.85} />
      </mesh>

      {ordered.map((id) => {
        const node = nodes[id];
        const meta = IMMERSIVE_SERVICES.find((s) => s.id === id);
        if (!node || !meta || !filters[meta.category]) return null;
        const radius = 0.28 + Math.min(0.55, node.connections * 0.08);
        return (
          <Billboard key={id} position={[node.position[0], node.position[1] + radius + 0.35, node.position[2]]}>
            <Text
              fontSize={0.26}
              color={hoveredNode === id || selectedNode === id ? '#f8fafc' : '#cbd5e1'}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="#0b1220"
            >
              {meta.name}
            </Text>
          </Billboard>
        );
      })}

      {tip && tipMeta && tipNode && (
        <Html position={[tip.pos[0], tip.pos[1] + 0.9, tip.pos[2]]} center style={{ pointerEvents: 'none' }}>
          <div className="node-tooltip">
            <strong>{tipMeta.name}</strong>
            <span className={`band-${tipNode.healthBand}`}>{tipNode.healthBand}</span>
            <span>{tipNode.latencyMs ?? '—'} ms · {tipNode.connections} links</span>
          </div>
        </Html>
      )}
    </group>
  );
}
