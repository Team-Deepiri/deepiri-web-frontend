import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./SidebarNav.css";
import logo from "../assets/images/logo.png";

// Icons
import { AiFillHome } from "react-icons/ai";
import { FiInfo, FiMail } from "react-icons/fi";

const SidebarNav: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  // Close dropdown after navigation
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  return (
    <>
      {/* TOP NAVBAR */}
      <nav className="sidebar-nav" aria-label="Top navigation">
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-controls="sidebar-links"
        >
          ☰ Menu
        </button>

        <div className="sidebar-brand">
          <img className="sidebar-logo" src={logo} alt="Deepiri logo" />
          <span className="sidebar-title">Deepiri</span>
        </div>
      </nav>

      {/* DROPDOWN MENU */}
      <div
        id="sidebar-links"
        className={`sidebar-links ${menuOpen ? "open" : ""}`}
      >
        <NavLink to="/" end onClick={closeMenu}>
          <AiFillHome size={18} />
          Home
        </NavLink>

        <NavLink to="/about" onClick={closeMenu}>
          <FiInfo size={18} />
          About
        </NavLink>

        <NavLink to="/contact" onClick={closeMenu}>
          <FiMail size={18} />
          Contact
        </NavLink>
      </div>
    </>
  );
};

export default SidebarNav;
