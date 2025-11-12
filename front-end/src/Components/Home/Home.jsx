import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";
import NavBar from "../NavBar/NavBar";

const API = process.env.REACT_APP_API_URL || "http://localhost:5050";

export default function Home() {
  const today = new Date();
  const options = { weekday: "long", month: "short", day: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", options);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      // Fetch profile to get calorie goal
      const profileRes = await fetch(`${API}/api/profile`);
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setCalorieGoal(profile.calorieGoal || 2000);
      }

      // Fetch today's meals to calculate consumed calories
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const mealsRes = await fetch(`${API}/api/meals?date=${todayStr}`);
      if (mealsRes.ok) {
        const data = await mealsRes.json();
        const total = (data.meals || []).reduce((sum, meal) => sum + (meal.calories || 0), 0);
        setCaloriesConsumed(total);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [location.pathname]); // Refresh when navigating to home

  const caloriesLeft = Math.max(0, calorieGoal - caloriesConsumed);
  const caloriePercentage = calorieGoal > 0 
    ? Math.min(100, (caloriesConsumed / calorieGoal) * 100) 
    : 0;

  // Calculate SVG circle progress (circumference = 2 * π * radius)
  const radius = 72; // radius of the circle (160px / 2 - 8px border)
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (caloriePercentage / 100) * circumference;

  const handleAddActivity = () => navigate("/tracking");
  const handleAddMeal = () => navigate("/add-meal");

  return (
    <div className="home-container">
      <header className="header">
        <img src="/Logo.png" alt="NutriLens logo" className="logo-img" />
        <span className="app-name">NutriLens</span>
      </header>

      <main className="content">
        <h2 className="date">TODAY, {formattedDate}</h2>

        <div className="calorie-circle">
          <div className="circle-wrapper">
            <svg className="progress-ring" width="160" height="160">
              {/* Background circle */}
              <circle
                className="progress-ring-background"
                stroke="#e0e0e0"
                strokeWidth="8"
                fill="transparent"
                r={radius}
                cx="80"
                cy="80"
              />
              {/* Progress circle */}
              <circle
                className="progress-ring-progress"
                stroke="#4caf50"
                strokeWidth="8"
                fill="transparent"
                r={radius}
                cx="80"
                cy="80"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div className="circle-text">
              <p className="kcal">{loading ? "..." : caloriesLeft}</p>
              <p>kcal left</p>
            </div>
          </div>
        </div>

        <div className="macros">
          <div className="macro">
            <div className="macro-ring"></div>
            <p>x/xxx g carbs</p>
          </div>
          <div className="macro">
            <div className="macro-ring"></div>
            <p>x/xxx g fat</p>
          </div>
          <div className="macro">
            <div className="macro-ring"></div>
            <p>x/xxx g protein</p>
          </div>
        </div>

        <section className="activity">
          <div className="section-header">
            <i className="ri-run-line icon" aria-hidden="true"></i>
            <h3>Activity</h3>
          </div>
          <button className="add-btn" onClick={handleAddActivity}>
            + Quick Add Activity
          </button>
        </section>

        <section className="meal">
          <div className="section-header">
            <i className="ri-restaurant-fill icon" aria-hidden="true"></i>
            <h3>Meals</h3>
          </div>
          <button className="add-btn" onClick={handleAddMeal}>
            + Quick Add Meal
          </button>
        </section>
      </main>
      <NavBar />
    </div>
  );
}
