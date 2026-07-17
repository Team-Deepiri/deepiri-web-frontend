import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { login } from "@/services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/");
    } catch {
      setError("Invalid credentials. Check email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Ambient orbs */}
      <div style={{ position: "fixed", top: "-4rem", left: "25%", width: "24rem", height: "24rem", background: "#6366f1", borderRadius: "50%", filter: "blur(80px)", opacity: 0.08, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-4rem", right: "20%", width: "24rem", height: "24rem", background: "#8b5cf6", borderRadius: "50%", filter: "blur(80px)", opacity: 0.08, pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: 380, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "40px 36px", position: "relative", zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg, var(--accent), var(--accent-ai))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 15, color: "#fff" }}>D</div>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18 }}>deep<span style={{ color: "var(--accent)" }}>iri</span></span>
        </div>

        <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Welcome back</div>
        <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 28 }}>Sign in to the Deepiri Hub</div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@deepiri.io" required
              style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dim)", display: "block", marginBottom: 6 }}>Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }}
            />
          </div>

          {error && <div style={{ fontSize: 12, color: "var(--error)", marginBottom: 16, padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>}

          <button
            type="submit" disabled={loading}
            style={{ width: "100%", padding: 12, background: "var(--accent)", border: "none", borderRadius: 8, color: "#fff", fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div style={{ marginTop: 24, fontSize: 10, color: "var(--dim)", textAlign: "center", letterSpacing: "0.06em" }}>
          auth-service :5001 · api-gateway :5100
        </div>
      </motion.div>
    </div>
  );
}
