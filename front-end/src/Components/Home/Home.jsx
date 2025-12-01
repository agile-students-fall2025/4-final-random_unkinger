import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";
import NavBar from "../NavBar/NavBar";
import GoalReminder from "./GoalReminder";

const API = process.env.REACT_APP_API_URL || "http://localhost:5050";

export default function Home() {
  const today = new Date();
  const options = { weekday: "long", month: "short", day: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", options);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(120);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [carbsConsumed, setCarbsConsumed] = useState(0);
  const [proteinConsumed, setProteinConsumed] = useState(0);
  const [fatConsumed, setFatConsumed] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch profile to get goals
      if (token) {
        const profileRes = await fetch(`${API}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setCalorieGoal(profile.calorieGoal || 2000);
          setProteinGoal(profile.proteinGoal || 120);
        }
      } else {
        // Default goals if not logged in
        setCalorieGoal(2000);
        setProteinGoal(120);
      }

      // Fetch today's meals to calculate consumed macros
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const mealsHeaders = {};
      if (token) {
        mealsHeaders.Authorization = `Bearer ${token}`;
      }
      const mealsRes = await fetch(`${API}/api/meals?date=${todayStr}`, {
        headers: mealsHeaders,
      });
      if (mealsRes.ok) {
        const data = await mealsRes.json();
        const totals = (data.meals || []).reduce(
          (acc, meal) => ({
            calories: acc.calories + (meal.calories || 0),
            carbs: acc.carbs + (meal.carbs || 0),
            protein: acc.protein + (meal.protein || 0),
            fat: acc.fat + (meal.fat || 0),
          }),
          { calories: 0, carbs: 0, protein: 0, fat: 0 }
        );
        setCaloriesConsumed(totals.calories);
        setCarbsConsumed(totals.carbs);
        setProteinConsumed(totals.protein);
        setFatConsumed(totals.fat);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [location.pathname]); 

  const caloriesLeft = Math.max(0, calorieGoal - caloriesConsumed);
  const caloriePercentage = calorieGoal > 0 
    ? Math.min(100, (caloriesConsumed / calorieGoal) * 100) 
    : 0;

  const carbsGoal = Math.round(calorieGoal * 0.5 / 4); 
  const fatGoal = Math.round(calorieGoal * 0.3 / 9); 

  const carbsPercentage = carbsGoal > 0 ? Math.min(100, (carbsConsumed / carbsGoal) * 100) : 0;
  const proteinPercentage = proteinGoal > 0 ? Math.min(100, (proteinConsumed / proteinGoal) * 100) : 0;
  const fatPercentage = fatGoal > 0 ? Math.min(100, (fatConsumed / fatGoal) * 100) : 0;

  const radius = 72; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (caloriePercentage / 100) * circumference;

  const macroRadius = 18;
  const macroCircumference = 2 * Math.PI * macroRadius;
  
  const carbsOffset = macroCircumference - (carbsPercentage / 100) * macroCircumference;
  const proteinOffset = macroCircumference - (proteinPercentage / 100) * macroCircumference;
  const fatOffset = macroCircumference - (fatPercentage / 100) * macroCircumference;

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

        <GoalReminder
          calorieGoal={calorieGoal}
          caloriesConsumed={caloriesConsumed}
          proteinGoal={proteinGoal}
          proteinConsumed={proteinConsumed}
          loading={loading}
        />

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
            <div className="macro-ring-wrapper">
              <svg className="macro-progress-ring" width="40" height="40">
                <circle
                  className="macro-ring-background"
                  stroke="#e0e0e0"
                  strokeWidth="3"
                  fill="transparent"
                  r={macroRadius}
                  cx="20"
                  cy="20"
                />
                <circle
                  className="macro-ring-progress"
                  stroke="#4caf50"
                  strokeWidth="3"
                  fill="transparent"
                  r={macroRadius}
                  cx="20"
                  cy="20"
                  strokeDasharray={macroCircumference}
                  strokeDashoffset={carbsOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <div className="macro-circle-text">
                {loading ? "..." : Math.round(carbsConsumed)}
              </div>
            </div>
            <p>{loading ? "..." : `${Math.round(carbsConsumed)}/${carbsGoal} g`} carbs</p>
          </div>
          <div className="macro">
            <div className="macro-ring-wrapper">
              <svg className="macro-progress-ring" width="40" height="40">
                <circle
                  className="macro-ring-background"
                  stroke="#e0e0e0"
                  strokeWidth="3"
                  fill="transparent"
                  r={macroRadius}
                  cx="20"
                  cy="20"
                />
                <circle
                  className="macro-ring-progress"
                  stroke="#4caf50"
                  strokeWidth="3"
                  fill="transparent"
                  r={macroRadius}
                  cx="20"
                  cy="20"
                  strokeDasharray={macroCircumference}
                  strokeDashoffset={fatOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <div className="macro-circle-text">
                {loading ? "..." : Math.round(fatConsumed)}
              </div>
            </div>
            <p>{loading ? "..." : `${Math.round(fatConsumed)}/${fatGoal} g`} fat</p>
          </div>
          <div className="macro">
            <div className="macro-ring-wrapper">
              <svg className="macro-progress-ring" width="40" height="40">
                <circle
                  className="macro-ring-background"
                  stroke="#e0e0e0"
                  strokeWidth="3"
                  fill="transparent"
                  r={macroRadius}
                  cx="20"
                  cy="20"
                />
                <circle
                  className="macro-ring-progress"
                  stroke="#4caf50"
                  strokeWidth="3"
                  fill="transparent"
                  r={macroRadius}
                  cx="20"
                  cy="20"
                  strokeDasharray={macroCircumference}
                  strokeDashoffset={proteinOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <div className="macro-circle-text">
                {loading ? "..." : Math.round(proteinConsumed)}
              </div>
            </div>
            <p>{loading ? "..." : `${Math.round(proteinConsumed)}/${proteinGoal} g`} protein</p>
          </div>
        </div>

        <div className="macro-info">
          <p className="macro-info-text">
            Carbs and fat goals are calculated based on your calorie goal: 50% from carbs (4 cal/g), 30% from fat (9 cal/g)
          </p>
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
