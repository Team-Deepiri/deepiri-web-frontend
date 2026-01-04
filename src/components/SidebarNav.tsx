import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

// ✅ Update path if your logo import differs
import logo from "../assets/images/logo.png";

type NavItem = {
  label: string;
  to: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
];

const SidebarNav: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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

  return (
    <>
      {/* TOP NAVBAR (fixed) */}
      <header className="deepiri-topnav">
        <div className="deepiri-topnav__inner">
          {/* LEFT: logo + name + hamburger */}
          <div className="deepiri-topnav__left" ref={dropdownRef}>
            <NavLink to="/" className="deepiri-brand" aria-label="Deepiri Home">
              <img src={logo} alt="Deepiri" className="deepiri-brand__logo" />
              <span className="deepiri-brand__name">Deepiri</span>
            </NavLink>

            <button
              type="button"
              className="deepiri-menu-btn"
              aria-label="Open navigation menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="deepiri-menu-btn__icon">☰</span>
            </button>

            {/* Dropdown */}
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
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: optional quick actions / placeholder */}
          <div className="deepiri-topnav__right">
            {/* Keep empty for now, or add buttons later */}
          </div>
        </div>
      </header>

    </>
  );
};

export default SidebarNav;
