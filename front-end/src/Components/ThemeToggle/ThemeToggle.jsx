import React from "react";

const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
      className="
        fixed bottom-5 right-5 z-50
        p-3 rounded-full shadow-lg border
        text-xl transition
        bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50
        dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700
      "
    >
      <i className={isDarkMode ? "ri-sun-line" : "ri-moon-line"} />
    </button>
  );
};

export default ThemeToggle;
