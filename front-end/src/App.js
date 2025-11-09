import "./App.css";
import { useState, useEffect } from "react";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import Home from "./Components/Home/Home";
import Profile from "./Components/Profile/Profile";
import AddMeal from "./Components/AddMeal/AddMeal";
import ScanMeal from "./Components/AddMeal/ScanMeal";
import ManualMeal from "./Components/AddMeal/ManualMeal";
import ActivityTracking from "./Components/ActivityTracking/ActivityTracking";
import EditMeal from "./Components/AddMeal/EditMeal";
import Search from './Components/Search/Search'
import ThemeToggle from "./Components/ThemeToggle/ThemeToggle";

import Diary from "./Components/Diary/Diary";
import DailyLog from "./Components/Diary/DailyLog";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//import Search from "./Components/Search/Search"

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    
    /*
    <div className="mobile-app-shell">
      <div className="mobile-section"><div className="page-frame"><LoginSignup /></div></div>
      <div className="mobile-section"><div className="page-frame"><Home /></div></div>
      <div className="mobile-section"><div className="page-frame"><AddMeal /></div></div>
      <div className="mobile-section"><div className="page-frame"><ScanMeal /></div></div>
      <div className="mobile-section"><div className="page-frame"><EditMeal /></div></div>

      {<Search/> }

      <div className="mobile-section"><div className="page-frame"><ActivityTracking /></div></div>

      <div className="mobile-section"><div className="page-frame"><Diary/></div></div>
      <div className="mobile-section"><div className="page-frame"><DailyLog/></div></div>

      <div className="mobile-section"><div className="page-frame"><Profile /></div></div>
    </div>
    */

    <Router>
      <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-meal" element={<AddMeal />} />
        <Route path="/scan-meal" element={<ScanMeal />} />
        <Route path="/manual-meal" element={<ManualMeal />} />
        <Route path="/edit-meal" element={<EditMeal />} />
        <Route path="/tracking" element={<ActivityTracking />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/daily-log" element={<DailyLog />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </Router>
  );
}

export default App;
