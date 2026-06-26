import { motion } from "framer-motion";

export default function Ops() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>Coming in Phase 4</div>
      <h1 style={{ fontFamily: "var(--font-head)", fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 12 }}>Ops</h1>
      <p style={{ color: "var(--dim)", fontSize: 13 }}>This page is built in Phase 4.</p>
    </motion.div>
  );
}
