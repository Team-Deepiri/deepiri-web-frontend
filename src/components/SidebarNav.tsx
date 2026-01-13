import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { FiInfo, FiStar } from "react-icons/fi";
import logo from "../assets/images/logo.png";

type NavItem = {
  label: string;
  to: string;
  icon?: string;
};

const PUBLIC_NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Features", to: "/features" },
  { label: "Contact", to: "/contact" },
];

const AUTHENTICATED_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: "🏠" },
  { label: "Tasks", to: "/tasks", icon: "📋" },
  { label: "Challenges", to: "/challenges", icon: "🎮" },
  { label: "Progress", to: "/gamification", icon: "⭐" },
  { label: "Leaderboard", to: "/leaderboard", icon: "🏆" },
  { label: "Analytics", to: "/analytics", icon: "📊" },
  { label: "Profile", to: "/profile", icon: "👤" },
  { label: "Notifications", to: "/notifications", icon: "🔔" },
  { label: "AI Assistant", to: "/agent", icon: "🤖" },
];

const SidebarNav: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

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
                  className="deepiri-btn deepiri-btn--secondary"
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
                    className="deepiri-dropdown__item"
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
        >
          <span></span>
        </button>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="deepiri-sidebar__overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
          }}
        />
      )}

      <aside
        className={`deepiri-sidebar ${isMobile && sidebarOpen ? 'deepiri-sidebar--open' : ''}`}
      >
        <div className="deepiri-sidebar__header">
          <NavLink to="/dashboard" className="deepiri-brand" aria-label="Deepiri Home">
            <img src={logo} alt="Deepiri" className="deepiri-brand__logo" />
            <span className="deepiri-brand__name">Deepiri</span>
          </NavLink>
        </div>

        <nav className="deepiri-sidebar__nav">
          {AUTHENTICATED_NAV_ITEMS.map((item) => (
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
              {item.icon && <span className="deepiri-sidebar__icon">{item.icon}</span>}
              <span className="deepiri-sidebar__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="deepiri-sidebar__footer">
          <div className="deepiri-sidebar__user">
            <div className="deepiri-sidebar__user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="deepiri-sidebar__user-info">
              <div className="deepiri-sidebar__user-name">{user?.name || "User"}</div>
              <div className="deepiri-sidebar__user-role">Adventurer</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="deepiri-sidebar__logout"
          >
            <span className="deepiri-sidebar__icon">🚪</span>
            <span className="deepiri-sidebar__label">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarNav;
