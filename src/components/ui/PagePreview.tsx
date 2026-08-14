import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

interface PagePreviewProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  status?: string;
}

export function PagePreview({ icon: Icon, eyebrow, title, description, status = "In development" }: PagePreviewProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
      {/* Eyebrow */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>
        <Sparkles size={12} />
        {eyebrow}
      </div>

      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "var(--gradient)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          flexShrink: 0,
          boxShadow: "0 8px 28px rgba(99,102,241,0.4)",
        }}>
          <Icon size={24} />
        </div>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {title}
        </h1>
      </div>

      <p style={{ color: "var(--dim)", fontSize: 13.5, lineHeight: 1.75, maxWidth: 600, marginBottom: 32 }}>
        {description}
      </p>

      {/* Preview card */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)",
        background: "var(--surface)",
        padding: "64px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        boxShadow: "var(--shadow-1)",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute",
          top: "-8rem",
          left: "50%",
          transform: "translateX(-50%)",
          width: "24rem",
          height: "24rem",
          background: "radial-gradient(circle, rgba(99,102,241,0.35), transparent 65%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          opacity: 0.5,
          pointerEvents: "none",
        }} />
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "var(--gradient-soft)",
          border: "1px solid rgba(99,102,241,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent)",
          position: "relative",
        }}>
          <Icon size={34} strokeWidth={1.6} />
        </div>
        <div className="eyebrow" style={{ fontWeight: 600 }}>{status}</div>
        <div style={{ fontSize: 13, color: "var(--dim)", maxWidth: 340, textAlign: "center", lineHeight: 1.7 }}>
          This view is next in line. The layout, navigation, and design system are already in place — the data and interactions land in the upcoming phase.
        </div>
        <div style={{
          marginTop: 6,
          padding: "7px 16px",
          borderRadius: 999,
          border: "1px solid rgba(99,102,241,0.35)",
          background: "rgba(99,102,241,0.08)",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--accent)",
          fontWeight: 600,
        }}>
          Coming soon
        </div>
      </div>
    </motion.div>
  );
}
