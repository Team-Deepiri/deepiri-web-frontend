import React, { useState } from "react";
import "./SidebarNav.css";

// Icons
import { AiFillHome } from "react-icons/ai";
import { FiInfo, FiStar, FiMail } from "react-icons/fi";

const SidebarNav: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLinkClick = () => {
    setMenuOpen(false);
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
      <div className={`sidebar-links ${menuOpen ? "open" : ""}`}>
        <a href="/" onClick={handleLinkClick}>
          <AiFillHome size={18} />
          Home
        </a>

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
      </div>
    </>
  );
};

export default SidebarNav;
