import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import "./NavBar.css"; // You can remove this once you're using Tailwind only

export default function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (to) => {
    navigate(to);
    setIsOpen(false);
  };

  const Item = ({ to, label, variant = "default" }) => {
    const isActive = pathname === to;

    const base =
      "px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center justify-center";
    const desktopStyles = isActive
      ? "bg-emerald-500 text-white shadow-sm"
      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700";
    const mobileStyles = isActive
      ? "bg-emerald-500 text-white shadow-sm"
      : "text-slate-700 hover:bg-emerald-50";

    const classes =
      variant === "mobile"
        ? `${base} w-full justify-start ${mobileStyles}`
        : `${base} ${desktopStyles}`;

    return (
      <button
        type="button"
        onClick={() => handleNavigation(to)}
        className={classes}
      >
        <span>{label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Desktop bottom pill nav */}
      <nav className="hidden md:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-100 px-3 py-2 shadow-lg">
          <Item to="/home" label="Home" />
          <Item to="/diary" label="Diary" />
          <Item to="/profile" label="Profile" />
        </div>
      </nav>

      {/* Mobile hamburger button (top-right) */}
      <button
        type="button"
        aria-label="Toggle menu"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`md:hidden fixed top-4 right-4 z-40 inline-flex flex-col justify-center items-center gap-[5px] rounded-full border border-emerald-100 bg-white/90 backdrop-blur-md p-2 shadow-md transition
          ${isOpen ? "bg-emerald-500 border-emerald-500" : ""}`}
      >
        <span
          className={`block h-[2px] w-5 rounded-full transition-transform ${
            isOpen
              ? "translate-y-[7px] rotate-45 bg-white"
              : "bg-emerald-700"
          }`}
        />
        <span
          className={`block h-[2px] w-5 rounded-full transition-opacity ${
            isOpen ? "opacity-0" : "bg-emerald-700 opacity-100"
          }`}
        />
        <span
          className={`block h-[2px] w-5 rounded-full transition-transform ${
            isOpen
              ? "-translate-y-[7px] -rotate-45 bg-white"
              : "bg-emerald-700"
          }`}
        />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile side menu (slides in from right) */}
      <nav
        className={`md:hidden fixed top-0 right-0 h-full w-64 max-w-[75%] z-40 bg-white/95 backdrop-blur-md border-l border-emerald-100 shadow-2xl transform transition-transform duration-200 ease-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-50">
          <h2 className="text-sm font-semibold text-emerald-900">Menu</h2>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
            className="text-xl leading-none text-slate-500 hover:text-emerald-600"
          >
            ×
          </button>
        </div>

        <div className="px-3 py-4 space-y-2">
          <Item to="/home" label="Home" variant="mobile" />
          <Item to="/diary" label="Diary" variant="mobile" />
          <Item to="/profile" label="Profile" variant="mobile" />
        </div>
      </nav>
    </>
  );
}
