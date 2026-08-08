import { useState } from "react";
import { motion } from "framer-motion";

const TOPICS = [
  { value: "support", label: "Question" },
  { value: "feedback", label: "Feedback" },
  { value: "bug", label: "Issue" },
  { value: "other", label: "Other" },
] as const;

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "36px 32px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-head)",
            fontWeight: 800,
            fontSize: 22,
            marginBottom: 6,
          }}
        >
          Contact us
        </div>
        <p style={{ fontSize: 12, color: "var(--dim)", marginBottom: 24 }}>
          Questions, feedback, or issues — send a message and we will get back to you.
        </p>

        {submitted ? (
          <p style={{ fontSize: 13, color: "var(--live)" }}>
            Thanks — your message was recorded locally. Wire this form to a platform endpoint when ready.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={{ fontSize: 11, color: "var(--dim)" }}>
              Name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Joe Smith"
                style={inputStyle}
              />
            </label>
            <label style={{ fontSize: 11, color: "var(--dim)" }}>
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@deepiri.io"
                style={inputStyle}
              />
            </label>
            <label style={{ fontSize: 11, color: "var(--dim)" }}>
              Topic
              {/* Controlled select — value on <select>, never selected on <option> */}
              <select
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={inputStyle}
              >
                <option value="" disabled>
                  Select…
                </option>
                {TOPICS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: 11, color: "var(--dim)" }}>
              Message
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here…"
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </label>
            <button
              type="submit"
              style={{
                padding: 12,
                background: "var(--accent)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontFamily: "var(--font-head)",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Send message
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
  fontSize: 13,
  outline: "none",
};
