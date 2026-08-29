import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Megaphone, Calendar, FileText, Users, Database,
  ListChecks, Wrench, Code2, Zap, User, Home as HomeIcon,
  ClipboardList, BarChart3, Bell, Bot, MessageSquare, Hammer, type LucideIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ROLES } from "../types/roles";
import type { DeepiriRole } from "../types/roles";
import logo from "../assets/images/logo_squared.png";

type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

const PUBLIC_NAV_ITEMS: Omit<NavItem, "icon">[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Codebase", to: "/codebase" },
  { label: "PR Impact", to: "/pr-impact" },
  { label: "Contact", to: "/contact" },
];

const isHub = import.meta.env.VITE_ENABLE_LIS !== 'true' && import.meta.env.VITE_ENABLE_CYREX !== 'true';

const HUB_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Tools", to: "/tools", icon: Hammer },
  { label: "Events", to: "/events", icon: Calendar },
  { label: "Documents", to: "/documents", icon: FileText },
  { label: "People", to: "/people", icon: Users },
  { label: "Registry", to: "/ops/registry", icon: Database },
  { label: "Jobs", to: "/ops/jobs", icon: ListChecks },
  { label: "Ops Hub", to: "/ops", icon: Wrench },
  { label: "Codebase", to: "/codebase", icon: Code2 },
  { label: "PR Impact", to: "/pr-impact", icon: Zap },
  { label: "Profile", to: "/profile", icon: User },
];

const AUTHENTICATED_NAV_ITEMS: NavItem[] = isHub
  ? HUB_NAV_ITEMS
  : [
      { label: "Dashboard", to: "/dashboard", icon: HomeIcon },
      { label: "Tasks", to: "/tasks", icon: ClipboardList },
      { label: "Analytics", to: "/analytics", icon: BarChart3 },
      { label: "Ops Hub", to: "/ops", icon: Wrench },
      { label: "Codebase", to: "/codebase", icon: Code2 },
      { label: "PR Impact", to: "/pr-impact", icon: Zap },
      { label: "Profile", to: "/profile", icon: User },
      { label: "Notifications", to: "/notifications", icon: Bell },
      { label: "AI Assistant", to: "/agent", icon: Bot },
      { label: "Group Chats", to: "/group-chats", icon: MessageSquare },
    ];

const SidebarNav: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { isAuthenticated, logout, user, deepiriRole } = useAuth() as any;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close on outside click / escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleSignOut = () => {
    logout();
    setOpen(false);
  };

  // Render top navbar for unauthenticated users
  if (!isAuthenticated) {
    return (
      <>
        {/* TOP NAVBAR (fixed) */}
        <header className={`deepiri-topnav ${scrolled ? "scrolled" : ""}`}>
          <div className="deepiri-topnav__inner">
            {/* LEFT: logo + name */}
            <NavLink to="/" className="deepiri-brand" aria-label="Deepiri Home">
              <img src={logo} alt="Deepiri" className="deepiri-brand__logo" />
              <span className="deepiri-brand__name">Deepiri</span>
            </NavLink>

            {/* CENTER: Desktop Navigation Links */}
            <nav className="deepiri-topnav__center">
              {PUBLIC_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `deepiri-nav-link ${isActive ? "is-active" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* RIGHT: Auth buttons + Mobile menu */}
            <div className="deepiri-topnav__right" ref={dropdownRef}>
              {/* Desktop Auth Buttons */}
              <div className="deepiri-topnav__auth-desktop">
                <NavLink
                  to="/login"
                  className="deepiri-btn deepiri-btn--signin"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/register"
                  className="deepiri-btn deepiri-btn--primary"
                >
                  Get Started
                </NavLink>
              </div>

              {/* Mobile Menu Button */}
              <button
                type="button"
                className="deepiri-menu-btn"
                aria-label="Open navigation menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <span className={`deepiri-menu-btn__icon ${open ? "open" : ""}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>

              {/* Mobile Dropdown */}
              {open && (
                <div className="deepiri-dropdown" role="menu">
                  {PUBLIC_NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `deepiri-dropdown__item ${isActive ? "is-active" : ""}`
                      }
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <div className="deepiri-dropdown__divider"></div>
                  <NavLink
                    to="/login"
                    className="deepiri-dropdown__item deepiri-dropdown__item--primary"
                    onClick={() => setOpen(false)}
                  >
                    Sign In
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="deepiri-dropdown__item deepiri-dropdown__item--primary"
                    onClick={() => setOpen(false)}
                  >
                    Get Started
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* Spacer to prevent content from going under navbar */}
        <div className="deepiri-topnav__spacer"></div>
      </>
    );
  }

  // Render left sidebar for authenticated users
  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          className="deepiri-sidebar__mobile-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
          aria-controls="deepiri-sidebar"
        >
          <span></span>
        </button>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="deepiri-sidebar__overlay--fixed"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        id="deepiri-sidebar"
        className={`deepiri-sidebar ${isMobile && sidebarOpen ? 'deepiri-sidebar--open' : ''}`}
      >
        <div className="deepiri-sidebar__header">
          <NavLink to="/dashboard" className="deepiri-brand" aria-label="Deepiri Home">
            <img src={logo} alt="Deepiri" className="deepiri-brand__logo" />
            <span className="deepiri-brand__name">Deepiri</span>
          </NavLink>
        </div>

        <nav className="deepiri-sidebar__nav">
          {AUTHENTICATED_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `deepiri-sidebar__link ${isActive ? "is-active" : ""}`
                }
                onClick={() => {
                  if (isMobile) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <Icon size={17} className="deepiri-sidebar__icon" aria-hidden="true" />
                <span className="deepiri-sidebar__label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="deepiri-sidebar__footer">
          <div className="deepiri-sidebar__user">
            {user?.avatarUrl || user?.metadata?.avatarUrl ? (
              <img src={user.avatarUrl || user.metadata.avatarUrl} alt="avatar" className="deepiri-sidebar__user-avatar" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="deepiri-sidebar__user-avatar">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="deepiri-sidebar__user-info">
              <div className="deepiri-sidebar__user-name">{user?.name || "User"}</div>
              <div className="deepiri-sidebar__user-role" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {deepiriRole ? (ROLES[deepiriRole as DeepiriRole]?.shortLabel || String(deepiriRole)) : ((user as any)?.metadata?.deepiriRole ? (ROLES[(user as any).metadata.deepiriRole as DeepiriRole]?.shortLabel || String((user as any).metadata.deepiriRole)) : 'Member')}
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="deepiri-sidebar__logout"
          >
            <span className="deepiri-sidebar__label">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarNav;
