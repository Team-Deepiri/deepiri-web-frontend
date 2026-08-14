import { NavLink } from "react-router-dom";
import { useUIStore } from "@/store/uiStore";
import { motion } from "framer-motion";
import {
  Home, Waves, Flame, LayoutGrid, Activity, GitBranch,
  Rocket, Sparkles, Network, GitPullRequest, Users, Compass, Mail,
  PanelLeftClose, PanelLeftOpen, type LucideIcon,
} from "lucide-react";

const NAV: { section: string; items: { to: string; icon: LucideIcon; label: string }[] }[] = [
  { section: "Platform", items: [
    { to: "/",            icon: Home,           label: "Home" },
    { to: "/events",      icon: Waves,          label: "Event River" },
    { to: "/dependencies", icon: Flame,         label: "Dependency Map" },
    { to: "/ops",         icon: LayoutGrid,     label: "Ops Dashboard" },
    { to: "/pulse",       icon: Activity,       label: "Platform Pulse" },
    { to: "/sankey",      icon: GitBranch,      label: "Traffic Flow" },
  ]},
  { section: "Repos", items: [
    { to: "/launchpad",   icon: Rocket,         label: "Launchpad" },
  ]},
  { section: "AI", items: [
    { to: "/ai",          icon: Sparkles,       label: "AI Workspace" },
  ]},
  { section: "Intelligence", items: [
    { to: "/codebase",    icon: Network,        label: "Codebase Graph" },
    { to: "/pr-impact",   icon: GitPullRequest, label: "PR Impact" },
  ]},
  { section: "Team", items: [
    { to: "/team",        icon: Users,          label: "Team Ops" },
    { to: "/onboarding",  icon: Compass,        label: "Start Here" },
    { to: "/contact",     icon: Mail,           label: "Contact" },
  ]},
];

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const w = sidebarCollapsed ? 64 : 232;

  return (
    <motion.aside
      animate={{ width: w }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      style={{
        width: w, minWidth: w,
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(14px)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "18px 16px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src="/favicon.ico"
          alt="Deepiri logo"
          style={{ width: 34, height: 34, borderRadius: 10, objectFit: "contain", background: "transparent", display: "block", flexShrink: 0, boxShadow: "0 4px 16px rgba(99,102,241,0.18)" }}
        />
        {!sidebarCollapsed && (
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em", color: "var(--text)" }}>
            deep<span style={{ background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>iri</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "14px 10px" }}>
        {NAV.map((section) => (
          <div key={section.section} style={{ marginBottom: 18 }}>
            {!sidebarCollapsed && (
              <div style={{ fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9ca3af", padding: "0 10px", marginBottom: 6, fontWeight: 600 }}>
                {section.section}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  style={({ isActive }) => ({
                    position: "relative",
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 10px", borderRadius: "var(--r-md)",
                    fontSize: 13, color: isActive ? "#fff" : "#6b7280",
                    background: isActive ? "var(--gradient)" : "transparent",
                    boxShadow: isActive ? "0 4px 14px rgba(99,102,241,0.25)" : "none",
                    marginBottom: 2, transition: "all 0.16s ease",
                    textDecoration: "none",
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",
                    fontWeight: isActive ? 600 : 500,
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                      {!sidebarCollapsed && item.label}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{ padding: "12px 16px", borderTop: "1px solid var(--border-soft)", background: "none", border: "none", color: "#6b7280", fontSize: 12, textAlign: "left", display: "flex", alignItems: "center", gap: 10, justifyContent: sidebarCollapsed ? "center" : "flex-start", transition: "color 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#1f2937")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
      >
        {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        {!sidebarCollapsed && "Collapse"}
      </button>
    </motion.aside>
  );
}
