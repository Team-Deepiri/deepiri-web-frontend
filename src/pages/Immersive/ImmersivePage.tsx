import { UniverseScene } from "@/immersive/scene/UniverseScene";
import { SceneControls } from "@/immersive/controls/SceneControls";
import { ServicePanel } from "@/immersive/panels/ServicePanel";
import "@/immersive/styles/index.css";

/**
 * Immersive 3D universe — same app, same container, route /immersive.
 * Previously a separate Vite app on :5174.
 */
export default function ImmersivePage() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <UniverseScene />
      <SceneControls />
      <ServicePanel />
    </div>
  );
}
