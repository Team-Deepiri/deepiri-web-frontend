import React from "react";
import { Link } from "react-router-dom";
import "./SidebarNav.css";

export default function SidebarNav() {
  return (
    <div className="sidebar-nav">
      <h1 className="sidebar-title">Deepiri</h1>

      <nav className="sidebar-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/events">Events</Link>
        <Link to="/friends">Friends</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    </div>
  );
}

