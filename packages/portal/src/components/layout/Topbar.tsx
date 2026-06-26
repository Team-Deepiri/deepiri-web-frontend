import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { useHealthStore } from "@/store/healthStore";
import { useAuthStore } from "@/store/authStore";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Home",
  "/events": "Event River",
  "/dependencies": "Dependency Map",
  "/ops": "Ops Dashboard",
  "/pulse": "Platform Pulse",
  "/sankey": "Traffic Flow",
  "/launchpad": "Launchpad",
  "/ai": "AI Workspace",
  "/team": "Team Ops",
  "/onboarding": "Start Here",
};

function HealthDots() {
  const services = useHealthStore((s) => s.services);
  const healthy = services.filter((s) => s.status === "healthy").length;
  const degraded = services.filter((s) => s.status === "degraded").length;
  const down = services.filter((s) => s.status === "down").length;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dim)" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--live)", display: "inline-block" }} />
      <span>{healthy}</span>
      {degraded > 0 && <>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--warn)", display: "inline-block", marginLeft: 4 }} />
        <span>{degraded}</span>
      </>}
      {down > 0 && <>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--error)", display: "inline-block", marginLeft: 4 }} />
        <span>{down}</span>
      </>}
    </div>
  );
}

function ImmersiveButton() {
  const immersiveLive = useUIStore((s) => s.immersiveLive);
  const { token } = useAuthStore();

  function launch() {
    const win = window.open("http://localhost:5174", "_blank");
    // Share JWT with Immersive via postMessage
    win?.addEventListener("load", () => {
      win.postMessage({ type: "DEEPIRI_AUTH", token }, "http://localhost:5174");
    });
  }

  return (
    <AnimatePresence>
      {immersiveLive && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={launch}
          style={{
            padding: "6px 14px", borderRadius: 8,
            background: "linear-gradient(135deg, var(--accent), var(--accent-ai))",
            border: "none", color: "#fff",
            fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 12,
            letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 0 16px rgba(99,102,241,0.4)",
          }}
        >
          ✦ Enter 3D
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function Topbar() {
  const location = useLocation();
  const label = ROUTE_LABELS[location.pathname] || "Hub";
  const { setCyrexOpen, cyrexOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);

  return (
    <header style={{
      height: "var(--topbar-h)", minHeight: "var(--topbar-h)",
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)",
      display: "flex", alignItems: "center",
      padding: "0 24px", gap: 16,
    }}>
      {/* Route label */}
      <div style={{ fontSize: 11, color: "var(--dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        deepiri / <span style={{ color: "var(--text)", fontWeight: 600 }}>{label}</span>
      </div>

      {/* Health dots */}
      <HealthDots />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Immersive button — only shown when live */}
      <ImmersiveButton />

      {/* Cyrex toggle */}
      <button
        onClick={() => setCyrexOpen(!cyrexOpen)}
        style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: cyrexOpen ? "rgba(139,92,246,0.1)" : "transparent", color: cyrexOpen ? "var(--accent-ai)" : "var(--dim)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}
      >
        ◐ AI
      </button>

      {/* Avatar */}
      <div style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg, var(--accent), var(--accent-ai))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "var(--font-head)", cursor: "pointer" }}>
        {user?.name?.[0]?.toUpperCase() || "U"}
      </div>
    </header>
  );
}
