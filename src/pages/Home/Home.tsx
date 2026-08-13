import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useHealthStore } from "@/store/healthStore";
import { useUIStore } from "@/store/uiStore";
import { STATUS_COLORS } from "@deepiri/shared";
import { RefreshCw } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const services = useHealthStore((s) => s.services);
  const immersiveLive = useUIStore((s) => s.immersiveLive);

  const healthy = services.filter((s) => s.status === "healthy").length;
  const degraded = services.filter((s) => s.status === "degraded").length;
  const down = services.filter((s) => s.status === "down").length;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 32 }}>
        <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 12 }}>Platform Overview</div>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10 }}>
          Deepiri <span style={{ background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Hub</span>
        </h1>
        <p style={{ color: "var(--dim)", fontSize: 14, lineHeight: 1.7, maxWidth: 560 }}>
          One place. Every team, every role, every system — visible and interactive together.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Healthy", value: healthy, color: "var(--live)" },
          { label: "Degraded", value: degraded, color: "var(--warn)" },
          { label: "Down", value: down, color: "var(--error)" },
        ].map((stat) => (
          <div key={stat.label} className="card card-hover" style={{ padding: "22px 26px" }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>{stat.label}</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 38, fontWeight: 700, color: stat.color, textShadow: `0 0 24px ${stat.color}40`, lineHeight: 1.1 }}>{stat.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Immersive CTA */}
      {immersiveLive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: "var(--gradient-soft)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "var(--r-lg)", padding: "26px 30px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-1)" }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 17, marginBottom: 4 }}>3D Universe Ready</div>
            <div style={{ fontSize: 12.5, color: "var(--dim)" }}>The immersive scene is live. See every service as a node in 3D space.</div>
          </div>
          <button
            onClick={() => navigate("/immersive")}
            className="btn btn-primary"
            style={{ fontSize: 13, fontWeight: 600 }}
          >
            Enter 3D →
          </button>
        </motion.div>
      )}

      {/* Service Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>All Services</div>
        {services.length === 0 ? (
          <div
            style={{
              border: "1px dashed var(--muted)",
              borderRadius: "var(--r-lg)",
              padding: "48px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              textAlign: "center",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
              <RefreshCw size={18} className="spin" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Waiting for registry health data</div>
            <div style={{ fontSize: 12.5, color: "var(--dim)", maxWidth: 380, lineHeight: 1.6 }}>
              Start the platform services (deepiri-registry, api-gateway) and the service catalog will appear here automatically.
            </div>
          </div>
        ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
          {services.map((svc) => (
            <div key={svc.serviceId} className="card card-hover" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: STATUS_COLORS[svc.status], flexShrink: 0, boxShadow: `0 0 10px ${STATUS_COLORS[svc.status]}` }} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{svc.name}</div>
                <div style={{ fontSize: 10.5, color: "var(--dim)", fontFamily: "var(--font-mono)" }}>:{svc.port}</div>
              </div>
            </div>
          ))}
        </div>
        )}
      </motion.div>
    </div>
  );
}
