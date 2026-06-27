import { useRef, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { STATUS_COLORS } from '@deepiri/shared'
import type { ServiceStatus } from '@deepiri/shared'

export interface PlanetProps {
  label: string
  health: ServiceStatus | 'Good' | 'Bad'   // support both old + new formats
  size: number
  orbitRadius: number
  orbitSpeed: number
  center: React.RefObject<THREE.Mesh | null>
  onClick?: () => void
}

// Map old health strings to new status colors
function resolveColor(health: string): string {
  if (health === 'Good' || health === 'healthy') return STATUS_COLORS.healthy
  if (health === 'degraded') return STATUS_COLORS.degraded
  if (health === 'Bad' || health === 'down') return STATUS_COLORS.down
  return STATUS_COLORS.unknown
}

export const Planet = forwardRef<THREE.Mesh, PlanetProps>(
  ({ label, health, size, orbitRadius, orbitSpeed, center, onClick }, ref) => {
    const localRef = useRef<THREE.Mesh>(null)
    const meshRef = (ref as React.RefObject<THREE.Mesh>) ?? localRef
    const labelRef = useRef<THREE.Group>(null)
    const orbitAngle = useRef(Math.random() * Math.PI * 2)
    const color = resolveColor(health)

    useFrame((_, delta) => {
      if (!meshRef.current || !labelRef.current || !center.current) return
      orbitAngle.current += orbitSpeed * delta
      const x = center.current.position.x + Math.cos(orbitAngle.current) * orbitRadius
      const z = center.current.position.z + Math.sin(orbitAngle.current) * orbitRadius
      meshRef.current.position.set(x, 0, z)
      labelRef.current.position.set(x, 0, z)
    })

    return (
      <>
        <mesh ref={meshRef} onClick={onClick}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
        </mesh>
        <group ref={labelRef}>
          <Billboard>
            <Text
              position={[0, size + 0.5, 0]}
              fontSize={0.4}
              color="white"
              anchorX="center"
              anchorY="bottom"
            >
              {label}
            </Text>
          </Billboard>
        </group>
      </>
    )
  }
)

Planet.displayName = 'Planet'
