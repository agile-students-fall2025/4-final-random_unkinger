import React from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <button 
      className={`theme-toggle ${isDarkMode ? 'dark' : ''}`}
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <i className={isDarkMode ? 'ri-sun-line' : 'ri-moon-line'}></i>
    </button>
  );
};

export default ThemeToggle;

