import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import "./SidebarNav.css";

// Icons
import { AiFillHome } from "react-icons/ai";
import { FiInfo, FiStar, FiMail, FiLogOut } from "react-icons/fi";

const SidebarNav: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

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

  return (
    <>
      {/* TOP NAVBAR */}
      <nav className="sidebar-nav">
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰ Menu
        </button>

        <div className="sidebar-title">Deepiri</div>
      </nav>

      {/* DROPDOWN MENU */}
      <div ref={sidebarRef} className={`sidebar-links ${menuOpen ? "open" : ""}`}>
        <a href="/" onClick={handleLinkClick}>
          <AiFillHome size={18} />
          Home
        </a>

        {isAuthenticated ? (
          <>
            <Link to="/dashboard" onClick={handleLinkClick}>
              <AiFillHome size={18} />
              Dashboard
            </Link>
            <button onClick={handleLogout} className="sidebar-logout-btn">
              <FiLogOut size={18} />
              Sign Out
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

            <a href="/contact" onClick={handleLinkClick}>
              <FiMail size={18} />
              Contact
            </a>
          </>
        )}
      </div>
    </>
  );
};

export default SidebarNav;
