import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { useHealthStore } from "@/store/healthStore";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/services/authService";
import { usePresence } from "@/hooks/usePresence";
import { Sparkles, LogOut, Boxes } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Home",
  "/events": "Event River",
  "/dependencies": "Dependency Map",
  "/ops": "Ops Dashboard",
  "/ops/jobs": "Jobs",
  "/ops/registry": "Registry",
  "/ops/truss": "Truss",
  "/ops/telemetry": "Telemetry",
  "/pulse": "Platform Pulse",
  "/sankey": "Traffic Flow",
  "/launchpad": "Launchpad",
  "/ai": "AI Workspace",
  "/team": "Team Ops",
  "/onboarding": "Start Here",
  "/contact": "Contact",
  "/codebase": "Codebase Graph",
  "/pr-impact": "PR Impact",
};

function HealthDots() {
  const services = useHealthStore((s) => s.services);
  const healthy = services.filter((s) => s.status === "healthy").length;
  const degraded = services.filter((s) => s.status === "degraded").length;
  const down = services.filter((s) => s.status === "down").length;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dim)" }}>
      <span title="healthy" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--live)", display: "inline-block", boxShadow: "0 0 8px rgba(34,197,94,0.7)" }} />
      <span>{healthy}</span>
      {degraded > 0 && <>
        <span title="degraded" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--warn)", display: "inline-block", marginLeft: 4, boxShadow: "0 0 8px rgba(245,158,11,0.7)" }} />
        <span>{degraded}</span>
      </>}
      {down > 0 && <>
        <span title="down" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--error)", display: "inline-block", marginLeft: 4, boxShadow: "0 0 8px rgba(239,68,68,0.7)" }} />
        <span>{down}</span>
      </>}
    </div>
  );
}

function ImmersiveButton() {
  const immersiveLive = useUIStore((s) => s.immersiveLive);
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {immersiveLive && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={() => navigate("/immersive")}
          className="btn btn-primary"
          style={{ padding: "7px 14px", fontSize: 12, letterSpacing: "0.02em" }}
        >
          <Boxes size={14} />
          Enter 3D
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
  const { peerCount, connected: presenceConnected } = usePresence(true);

  return (
    <header style={{
      height: "var(--topbar-h)", minHeight: "var(--topbar-h)",
      borderBottom: "1px solid var(--border)",
      background: "rgba(255,255,255,0.82)",
      backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center",
      padding: "0 24px", gap: 16,
      position: "relative",
      zIndex: 15,
    }}>
      {/* Route label */}
      <div style={{ fontSize: 11, color: "var(--dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        deepiri / <span style={{ color: "var(--text)", fontWeight: 600 }}>{label}</span>
      </div>

      {/* Health dots */}
      <HealthDots />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Multi-user presence via platform realtime-gateway */}
      <div
        title={
          presenceConnected
            ? `${peerCount} other user${peerCount === 1 ? "" : "s"} on this hub (realtime-gateway)`
            : "Presence connecting to realtime-gateway…"
        }
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontSize: 11,
          color: "var(--dim)",
          padding: "5px 10px",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: presenceConnected ? "var(--live)" : "var(--warn)",
            display: "inline-block",
            boxShadow: `0 0 8px ${presenceConnected ? "rgba(34,197,94,0.7)" : "rgba(245,158,11,0.7)"}`,
          }}
        />
        <span>{peerCount} online</span>
      </div>

      {/* Immersive button — only shown when live */}
      <ImmersiveButton />

      {/* Cyrex toggle */}
      <button
        onClick={() => setCyrexOpen(!cyrexOpen)}
        className="btn btn-ghost"
        style={{ padding: "6px 12px", fontSize: 11, letterSpacing: "0.05em", color: cyrexOpen ? "var(--accent-ai)" : "var(--dim)" }}
      >
        <Sparkles size={13} />
        AI
      </button>

      {/* Avatar + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          title={user?.email || user?.name || "User"}
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--r-md)",
            background: "var(--gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "var(--font-head)",
            boxShadow: "0 3px 12px rgba(99,102,241,0.35)",
          }}
        >
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="btn btn-ghost"
          style={{ padding: "6px 10px", fontSize: 11, gap: 6 }}
        >
          <LogOut size={13} />
          Log out
        </button>
      </div>
    </header>
  );
}
