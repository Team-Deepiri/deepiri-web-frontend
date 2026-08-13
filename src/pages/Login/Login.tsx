import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthError, login } from "@/services/authService";
import { Lock, Mail } from "lucide-react";

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
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "Invalid credentials. Check email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      {/* Ambient orbs */}
      <div style={{ position: "fixed", top: "-6rem", left: "22%", width: "28rem", height: "28rem", background: "#6366f1", borderRadius: "50%", filter: "blur(110px)", opacity: 0.08, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-6rem", right: "18%", width: "28rem", height: "28rem", background: "#fbbf24", borderRadius: "50%", filter: "blur(110px)", opacity: 0.07, pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: "30%", left: "8%", width: "12rem", height: "12rem", background: "#8b5cf6", borderRadius: "50%", filter: "blur(90px)", opacity: 0.04, pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 400,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(18px)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          padding: "44px 40px",
          position: "relative",
          zIndex: 1,
          boxShadow: "var(--shadow-2)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <img
            src="/favicon.ico"
            alt="Deepiri logo"
            style={{ width: 42, height: 42, borderRadius: 12, objectFit: "contain", background: "transparent", display: "block", boxShadow: "0 6px 20px rgba(99,102,241,0.25)" }}
          />
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 19 }}>
            deep<span style={{ background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>iri</span>
          </span>
        </div>

        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 24, marginBottom: 6, letterSpacing: "-0.01em" }}>Welcome back</div>
        <div style={{ fontSize: 13, color: "var(--dim)", marginBottom: 30 }}>Sign in to the Deepiri Hub</div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 18 }}>
            <label className="eyebrow" style={{ display: "block", marginBottom: 7, fontWeight: 600 }}>Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@deepiri.io" required
                className="field"
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 26 }}>
            <label className="eyebrow" style={{ display: "block", marginBottom: 7, fontWeight: 600 }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="field"
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: "var(--error)", marginBottom: 18, padding: "10px 14px", background: "rgba(239,68,68,0.1)", borderRadius: "var(--r-md)", border: "1px solid rgba(239,68,68,0.25)", lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: 13, fontSize: 14, fontWeight: 600, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <div style={{ marginTop: 28, fontSize: 10, color: "var(--dim)", textAlign: "center", letterSpacing: "0.06em", lineHeight: 1.8 }}>
          auth-service :5001 · api-gateway :5100
          <div style={{ marginTop: 8 }}>
            <a href="/contact" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 12 }}>
              Contact support
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
