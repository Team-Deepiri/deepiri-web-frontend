import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useHealthPoll } from "@/hooks/useHealthPoll";
import { useHealthStore } from "@/store/healthStore";
import { STATUS_COLORS } from "@deepiri/shared";

function formatLastPing(ts: number): string {
  const seconds = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
}

export default function Ops() {
  const { refresh } = useHealthPoll();
  const { services, isLoading, lastUpdated } = useHealthStore();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em" }}>
          Platform Ops Hub
        </h1>
        <button
          onClick={() => void refresh()}
          disabled={isLoading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--dim)",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "6px 12px",
            cursor: isLoading ? "default" : "pointer",
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <RefreshCw size={14} className={isLoading ? "spin" : undefined} /> Refresh
        </button>
      </div>

      <p style={{ color: "var(--dim)", fontSize: 13, marginBottom: 24 }}>
        Live service catalog and health via deepiri-registry.
        {lastUpdated ? ` Updated ${formatLastPing(lastUpdated)}.` : ""}
      </p>

      {isLoading && services.length === 0 ? (
        <p style={{ color: "var(--dim)", fontSize: 13 }}>Checking services…</p>
      ) : services.length === 0 ? (
        <p style={{ color: "var(--dim)", fontSize: 13 }}>
          No services reporting yet. deepiri-registry may still be starting up.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          }}
        >
          {services.map((s) => (
            <div
              key={s.serviceId}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 16,
                background: "var(--surface)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: STATUS_COLORS[s.status],
                  }}
                >
                  {s.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--dim)" }}>
                {s.port ? `port ${s.port} · ` : ""}
                {formatLastPing(s.lastPing)}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
