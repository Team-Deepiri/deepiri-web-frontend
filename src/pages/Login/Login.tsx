import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthError, login } from "@/services/authService";
import { Check, Circle, Lock, Mail } from "lucide-react";

// Mirrors the auth-service password validator (commonValidations.password):
// 8-128 chars AND /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
// Each regex is a simple/anchored character class, so evaluation is linear.
const passwordRules: { label: string; test: (pw: string) => boolean }[] = [
  { label: "8–128 characters", test: (pw) => pw.length >= 8 && pw.length <= 128 },
  { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One number", test: (pw) => /\d/.test(pw) },
  { label: "One special character (@ $ ! % * ? &)", test: (pw) => /[@$!%*?&]/.test(pw) },
  { label: "Only letters, numbers, and @ $ ! % * ? &", test: (pw) => pw.length > 0 && /^[A-Za-z\d@$!%*?&]+$/.test(pw) },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <img
            src="/favicon.ico"
            alt="Deepiri logo"
            style={{ width: 36, height: 36, borderRadius: 9, objectFit: "contain", background: "transparent", display: "block" }}
          />
          <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1, fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18 }}>
            deep<span style={{ color: "var(--accent)" }}>iri</span>
          </span>
        </div>

        <div style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Welcome back</div>
        <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 28 }}>Sign in to the Deepiri Hub</div>

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
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••" required
                className="field"
                style={{ paddingLeft: 36 }}
              />
            </div>

            {(passwordFocused || password.length > 0) && (
              <ul
                aria-live="polite"
                style={{ listStyle: "none", margin: "10px 0 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 4 }}
              >
                {passwordRules.map(({ label, test }) => {
                  const ok = test(password);
                  return (
                    <li
                      key={label}
                      style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: ok ? "#16a34a" : "var(--dim)" }}
                    >
                      {ok ? <Check size={13} aria-hidden="true" /> : <Circle size={13} aria-hidden="true" />}
                      <span>
                        {label}
                        <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 }}>
                          {ok ? " — met" : " — not met"}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
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
