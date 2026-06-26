import { UniverseScene } from './scene/UniverseScene'
import { SceneControls } from './controls/SceneControls'
import { ServicePanel } from './panels/ServicePanel'

/**
 * Deepiri Immersive — 3D Universe Scene
 *
 * Built on top of the original Planet/orbit system from deepiri_immersive.
 * Extended with:
 * - Hub Server health data wiring (planets = real services)
 * - Health-based color coding using @deepiri/shared STATUS_COLORS
 * - SceneControls overlay (category filters, particle toggle, gravity mode)
 * - ServicePanel (click a planet to inspect a service)
 * - JWT auth from Portal via postMessage
 * - Back to Portal button
 */
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      {/* The 3D canvas — fills everything */}
      <UniverseScene />

      {/* UI overlays — sit on top of the canvas */}
      <SceneControls />
      <ServicePanel />
    </div>
  )
}
