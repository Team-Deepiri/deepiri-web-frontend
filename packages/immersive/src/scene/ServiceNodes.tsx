import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { IMMERSIVE_SERVICES } from '../config/services';
import { useSceneStore, type HealthBand } from '../store/sceneStore';

const BAND_COLOR: Record<HealthBand, string> = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
};

function ServiceSphere({ id }: { id: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const node = useSceneStore((s) => s.nodes[id]);
  const selected = useSceneStore((s) => s.selectedNode === id);
  const setSelectedNode = useSceneStore((s) => s.setSelectedNode);
  const setCameraTarget = useSceneStore((s) => s.setCameraTarget);
  const filters = useSceneStore((s) => s.filters);
  const meta = IMMERSIVE_SERVICES.find((s) => s.id === id);

  useFrame(() => {
    if (!mesh.current || !node) return;
    mesh.current.position.set(...node.position);
    if (ring.current) {
      ring.current.position.set(...node.position);
      ring.current.visible = selected;
      ring.current.rotation.x = Math.PI / 2;
    }
  });

  if (!node || !meta || !filters[meta.category]) return null;

  const radius = 0.28 + Math.min(0.55, node.connections * 0.08);
  const color = BAND_COLOR[node.healthBand];

  return (
    <group>
      <mesh
        ref={mesh}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNode(id);
          setCameraTarget(node.position);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          if (mesh.current) mesh.current.scale.setScalar(1.15);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          if (mesh.current) mesh.current.scale.setScalar(1);
        }}
      >
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[radius * 1.45, 0.03, 8, 48]} />
        <meshBasicMaterial color="#e2e8f0" transparent opacity={0.8} />
      </mesh>
      <Billboard position={[node.position[0], node.position[1] + radius + 0.35, node.position[2]]}>
        <Text fontSize={0.28} color="#cbd5e1" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#0b1220">
          {meta.name}
        </Text>
      </Billboard>
    </group>
  );
}

export function ServiceNodes() {
  const ids = useMemo(() => IMMERSIVE_SERVICES.map((s) => s.id), []);
  return (
    <group>
      {ids.map((id) => (
        <ServiceSphere key={id} id={id} />
      ))}
    </group>
  );
}
