import { useState } from "react";
import { motion } from "framer-motion";
import { useUIStore } from "@/store/uiStore";

const QUICK_ACTIONS = [
  "What services are down?",
  "Show recent errors",
  "Summarize today's activity",
  "What did the team ship this week?",
];

export function CyrexSidebar() {
  const { setCyrexOpen } = useUIStore();
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hey — I'm Cyrex. Ask me anything about the Deepiri platform." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
      });
      const data = await res.json();
      const reply = data?.content?.[0]?.text || data?.message || "Got it.";
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Cyrex is unavailable right now. Make sure diri-cyrex is running on :8000." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.aside
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      style={{
        width: "var(--ai-sidebar-w)", minWidth: "var(--ai-sidebar-w)",
        background: "var(--surface)",
        borderLeft: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>◐</span>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13, color: "var(--accent-ai)" }}>Cyrex AI</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--live)", display: "inline-block" }} />
        </div>
        <button onClick={() => setCyrexOpen(false)} style={{ background: "none", border: "none", color: "var(--dim)", fontSize: 16 }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "85%",
            background: msg.role === "user" ? "rgba(99,102,241,0.15)" : "var(--card)",
            border: `1px solid ${msg.role === "user" ? "rgba(99,102,241,0.3)" : "var(--border)"}`,
            borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
            padding: "10px 12px",
            fontSize: 12, lineHeight: 1.6,
            color: msg.role === "user" ? "var(--text)" : "var(--dim)",
          }}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", color: "var(--dim)", fontSize: 12, fontStyle: "italic" }}>Cyrex is thinking...</div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 6 }}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            onClick={() => send(action)}
            style={{ padding: "4px 10px", borderRadius: 20, border: "1px solid var(--border)", background: "transparent", color: "var(--dim)", fontSize: 10, letterSpacing: "0.04em" }}
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "12px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask Cyrex anything..."
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 8,
            background: "var(--card)", border: "1px solid var(--border)",
            color: "var(--text)", fontSize: 12, outline: "none",
          }}
        />
        <button
          onClick={() => send(input)}
          style={{ padding: "8px 14px", borderRadius: 8, background: "var(--accent-ai)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600 }}
        >
          →
        </button>
      </div>
    </motion.aside>
  );
}
