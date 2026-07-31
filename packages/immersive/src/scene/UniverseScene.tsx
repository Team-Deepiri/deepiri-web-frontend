import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { StarField } from './StarField';
import { ServiceNodes } from './ServiceNodes';
import { EdgeLines } from './EdgeLines';
import { EventParticles } from './EventParticles';
import { ConstellationForce } from '../gravity/ConstellationForce';
import { useSceneStore } from '../store/sceneStore';

function CameraRig() {
  const { camera } = useThree();
  const target = useSceneStore((s) => s.cameraTarget);
  const look = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, dt) => {
    if (!target) return;
    const desired = new THREE.Vector3(target[0] + 4, target[1] + 2.5, target[2] + 4);
    camera.position.lerp(desired, Math.min(1, dt * 2));
    look.current.lerp(new THREE.Vector3(...target), Math.min(1, dt * 2));
    camera.lookAt(look.current);
  });
  return null;
}

function GravityDriver() {
  const force = useRef(new ConstellationForce());
  const constellationMode = useSceneStore((s) => s.constellationMode);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const traffic = useSceneStore((s) => s.traffic);
  const lastHeat = useRef(0);

  useEffect(() => {
    if (constellationMode && !reducedMotion) {
      force.current.start();
      return () => force.current.stop();
    }
    force.current.stop();
    return undefined;
  }, [constellationMode, reducedMotion]);

  useFrame((state) => {
    if (!constellationMode || reducedMotion) return;
    // Reheat occasionally when traffic changes / every few seconds
    if (state.clock.elapsedTime - lastHeat.current > 3) {
      force.current.reheat();
      lastHeat.current = state.clock.elapsedTime;
    }
  });

  // touch traffic so component re-renders when traffic map identity changes
  void traffic;

  return null;
}

export function UniverseScene() {
  const reducedMotion = useSceneStore((s) => s.reducedMotion);

  return (
    <Canvas
      camera={{ position: [0, 8, 18], fov: 50, near: 0.1, far: 200 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor('#05080f');
      }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[10, 12, 8]} intensity={1.2} color="#c7d2fe" />
      <pointLight position={[-12, -4, -6]} intensity={0.6} color="#67e8f9" />
      {!reducedMotion && <StarField />}
      <EdgeLines />
      <ServiceNodes />
      {!reducedMotion && <EventParticles />}
      <CameraRig />
      <GravityDriver />
      <OrbitControls enableDamping dampingFactor={0.08} maxDistance={40} minDistance={4} />
    </Canvas>
  );
}
