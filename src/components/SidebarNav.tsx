import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/images/logo.png";

type NavItem = {
  label: string;
  to: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Features", to: "/features" },
  { label: "Contact", to: "/contact" },
];

const SidebarNav: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

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
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    if (menuOpen) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
    }

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
    toast.success('Logged out successfully');
  };

  const handleSignOut = () => {
    logout();
    setOpen(false);
  };

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
            {NAV_ITEMS.map((item) => (
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
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/dashboard"
                    className="deepiri-btn deepiri-btn--secondary"
                  >
                    Dashboard
                  </NavLink>
                  <button
                    onClick={handleSignOut}
                    className="deepiri-btn deepiri-btn--primary"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
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
          </>
        ) : (
          <>
            <a href="/about" onClick={handleLinkClick}>
              <FiInfo size={18} />
              About
            </a>

            <a href="/features" onClick={handleLinkClick}>
              <FiStar size={18} />
              Features
            </a>

            {/* Mobile Dropdown */}
            {open && (
              <div className="deepiri-dropdown" role="menu">
                {NAV_ITEMS.map((item) => (
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
                {isAuthenticated ? (
                  <>
                    <NavLink
                      to="/dashboard"
                      className="deepiri-dropdown__item"
                      onClick={() => setOpen(false)}
                    >
                      Dashboard
                    </NavLink>
                    <button
                      onClick={handleSignOut}
                      className="deepiri-dropdown__item deepiri-dropdown__item--danger"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      {/* Spacer to prevent content from going under navbar */}
      <div className="deepiri-topnav__spacer"></div>
    </>
  );
};

export default SidebarNav;
