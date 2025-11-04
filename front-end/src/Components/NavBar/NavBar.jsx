import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const Item = ({ to, label }) => (
    <button
      className={`nav-item ${pathname === to ? "active" : ""}`}
      onClick={() => navigate(to)}
      type="button"
    >
      <span className="nav-label">{label}</span>
    </button>
  );

  return (
    <nav className="navbar">
      <Item to="/home" label="Home" />
      <Item to="/diary" label="Diary" />
      <Item to="/profile" label="Profile" />
    </nav>
  );
}
