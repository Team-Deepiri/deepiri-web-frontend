import { motion } from "framer-motion";
import { useHealthStore } from "@/store/healthStore";
import { useUIStore } from "@/store/uiStore";
import { STATUS_COLORS } from "@deepiri/shared";

export default function Home() {
  const services = useHealthStore((s) => s.services);
  const immersiveLive = useUIStore((s) => s.immersiveLive);
  const { token } = useUIStore();

  const healthy = services.filter((s) => s.status === "healthy").length;
  const degraded = services.filter((s) => s.status === "degraded").length;
  const down = services.filter((s) => s.status === "down").length;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>Platform Overview</div>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 36, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 8 }}>Deepiri Hub</h1>
        <p style={{ color: "var(--dim)", fontSize: 13, lineHeight: 1.7 }}>
          One place. Every team, every role, every system — visible and interactive together.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Healthy", value: healthy, color: "var(--live)" },
          { label: "Degraded", value: degraded, color: "var(--warn)" },
          { label: "Down", value: down, color: "var(--error)" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 36, fontWeight: 900, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Immersive CTA */}
      {immersiveLive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 14, padding: "24px 28px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 18, marginBottom: 4 }}>✦ 3D Universe Ready</div>
            <div style={{ fontSize: 12, color: "var(--dim)" }}>The immersive scene is live. See every service as a node in 3D space.</div>
          </div>
          <button
            onClick={() => window.open("http://localhost:5174", "_blank")}
            style={{ padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg, var(--accent), var(--accent-ai))", border: "none", color: "#fff", fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13, boxShadow: "0 0 20px rgba(99,102,241,0.3)", whiteSpace: "nowrap" }}
          >
            Enter 3D →
          </button>
        </motion.div>
      )}

      {/* Service Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", marginBottom: 12 }}>All Services</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {services.length === 0 ? (
            <div style={{ color: "var(--dim)", fontSize: 12, gridColumn: "1/-1", padding: "32px 0" }}>
              Waiting for Hub Server health data...
            </div>
          ) : services.map((svc) => (
            <div key={svc.serviceId} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[svc.status], flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{svc.name}</div>
                <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--font-mono)" }}>:{svc.port}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
