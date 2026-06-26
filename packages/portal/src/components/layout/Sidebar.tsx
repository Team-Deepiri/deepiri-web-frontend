import { NavLink } from "react-router-dom";
import { useUIStore } from "@/store/uiStore";
import { motion } from "framer-motion";

const NAV = [
  { section: "Platform", items: [
    { to: "/",            icon: "⬡", label: "Home" },
    { to: "/events",      icon: "🌊", label: "Event River" },
    { to: "/dependencies",icon: "🔥", label: "Dependency Map" },
    { to: "/ops",         icon: "◫", label: "Ops Dashboard" },
    { to: "/pulse",       icon: "📈", label: "Platform Pulse" },
    { to: "/sankey",      icon: "◈", label: "Traffic Flow" },
  ]},
  { section: "Repos", items: [
    { to: "/launchpad",   icon: "◉", label: "Launchpad" },
  ]},
  { section: "AI", items: [
    { to: "/ai",          icon: "◐", label: "AI Workspace" },
  ]},
  { section: "Team", items: [
    { to: "/team",        icon: "◳", label: "Team Ops" },
    { to: "/onboarding",  icon: "★", label: "Start Here" },
  ]},
];

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const w = sidebarCollapsed ? 60 : 220;

  return (
    <motion.aside
      animate={{ width: w }}
      transition={{ duration: 0.2 }}
      style={{
        width: w, minWidth: w,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "18px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, var(--accent), var(--accent-ai))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0 }}>D</div>
        {!sidebarCollapsed && (
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, letterSpacing: "0.02em" }}>
            deep<span style={{ color: "var(--accent)" }}>iri</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        {NAV.map((section) => (
          <div key={section.section} style={{ marginBottom: 16 }}>
            {!sidebarCollapsed && (
              <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dim)", padding: "0 8px", marginBottom: 4 }}>
                {section.section}
              </div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 6,
                  fontSize: 12, color: isActive ? "var(--accent)" : "var(--dim)",
                  background: isActive ? "rgba(99,102,241,0.08)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(99,102,241,0.2)" : "transparent"}`,
                  marginBottom: 2, transition: "all 0.15s",
                  textDecoration: "none",
                })}
              >
                <span style={{ fontSize: 15, width: 18, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                {!sidebarCollapsed && item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", background: "none", border: "none", color: "var(--dim)", fontSize: 12, textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}
      >
        <span>{sidebarCollapsed ? "→" : "←"}</span>
        {!sidebarCollapsed && "Collapse"}
      </button>
    </motion.aside>
  );
}
