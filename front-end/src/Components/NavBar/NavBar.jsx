import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (to) => {
    navigate(to);
    setIsOpen(false);
  };

  const Item = ({ to, label }) => (
    <button
      className={`nav-item ${pathname === to ? "active" : ""}`}
      onClick={() => handleNavigation(to)}
      type="button"
    >
      <span className="nav-label">{label}</span>
    </button>
  );

  return (
    <>
      {/* desktop nav */}
      <nav className="navbar desktop-nav">
        <Item to="/home" label="Home" />
        <Item to="/diary" label="Diary" />
        <Item to="/profile" label="Profile" />
      </nav>

      {/* mobile hamburger*/}
      <button
        className={`hamburger-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {isOpen && (
        <div className="menu-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* mobile side menu */}
      <nav className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <h2>Menu</h2>
          <button
            className="close-btn"
            onClick={() => setIsOpen(false)}
            type="button"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <div className="mobile-menu-items">
          <Item to="/home" label="Home" />
          <Item to="/diary" label="Diary" />
          <Item to="/profile" label="Profile" />
        </div>
      </nav>
    </>
  );
}
