import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { Planet } from './Planet'
import { useSceneStore } from '@/store/sceneStore'
import { useHubConnection } from '@/hooks/useHubConnection'
import { usePortalAuth } from '@/hooks/usePortalAuth'

// Map service category to orbit ring
const ORBIT_CONFIG: Record<string, { radius: number; speed: number }> = {
  Platform: { radius: 5,  speed: 0.3 },
  AI:       { radius: 9,  speed: 0.2 },
  Comms:    { radius: 13, speed: 0.15 },
  Tooling:  { radius: 16, speed: 0.1 },
  Experimental: { radius: 19, speed: 0.08 },
}

export function UniverseScene() {
  // Connect to Hub Server on mount
  useHubConnection()
  usePortalAuth()

  const coreRef = useRef<THREE.Mesh>(null)
  const { services, setSelectedService, filterCategories } = useSceneStore()

  return (
    <Canvas
      camera={{ position: [0, 8, 20], fov: 60 }}
      style={{ height: '100vh', width: '100vw', background: '#000' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[10, 10, 5]} color="white" intensity={1} />
      <pointLight position={[0, 0, 0]} color="#6366f1" intensity={2} distance={30} />

      {/* Star field */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Core — Deepiri platform */}
      <Planet
        ref={coreRef}
        label="Deepiri"
        health="healthy"
        size={1.2}
        orbitRadius={0}
        orbitSpeed={0}
        center={coreRef}
      />

      {/* Services from Hub Server — rendered as orbiting planets */}
      {services
        .filter((svc) => filterCategories.includes(svc.name || ''))
        .map((svc, i) => {
          const category = (svc as any).category || 'Platform'
          const config = ORBIT_CONFIG[category] || ORBIT_CONFIG.Platform
          // Stagger orbit radius slightly per service to avoid overlap
          const staggeredRadius = config.radius + (i % 3) * 1.5
          return (
            <Planet
              key={svc.serviceId}
              label={svc.name}
              health={svc.status}
              size={0.4}
              orbitRadius={staggeredRadius}
              orbitSpeed={config.speed + Math.random() * 0.05}
              center={coreRef}
              onClick={() => setSelectedService(svc.serviceId)}
            />
          )
        })}

      {/* If no services loaded yet — show placeholder planets matching original */}
      {services.length === 0 && (
        <Planet
          label="Voxier"
          health="Bad"
          size={0.5}
          orbitRadius={5}
          orbitSpeed={0.5}
          center={coreRef}
        />
      )}

      <OrbitControls
        enableDamping={true}
        enableZoom={true}
        enablePan={false}
        dampingFactor={0.05}
      />
    </Canvas>
  )
}
