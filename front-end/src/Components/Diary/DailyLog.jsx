import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DailyLog.css";
import NavBar from "../NavBar/NavBar";

const Pencil = () => <span style={{ fontSize: "14px" }}>✏️</span>;

const API = process.env.REACT_APP_API_URL || "http://localhost:5050";

export default function DailyLog() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date) return;

    fetch(`${API}/api/meals?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setMeals(data.meals || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching meals:", err);
        setLoading(false);
      });
  }, [date]);

  // Calculate totals from meals
  const totals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        protein: acc.protein + (meal.protein || 0),
        fat: acc.fat + (meal.fat || 0),
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
  }, [meals]);

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "short",
      day: "numeric",
    }
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dailylog-container">
      <header className="header">
        <div className="text">Diary</div>
        <div className="underline"></div>
      </header>

      <main className="content">
        <button className="date-btn">Date: {formattedDate}</button>

        <div className="macro-summary">
          <p>
            Total Calories: {totals.calories} kcal
          </p>
          <p>
            Total Carbs: {totals.carbs} g
          </p>
          <p>
            Total Protein: {totals.protein} g
          </p>
          <p>
            Total Fat: {totals.fat} g
          </p>
        </div>

        <div className="meal-list">
          {meals.map((meal) => (
            <div className="meal-card" key={meal.id}>
              <div className="meal-name-row">
                <div className="meal-name">{meal.name}</div>
                <span className={`meal-source-tag meal-source-tag--${meal.source || "manual"}`}>
                  {meal.source === "scanned" ? "Scanned" : "Manual"}
                </span>
              </div>
              <div className="meal-content-row">
                <img
                  src={meal.image || "https://picsum.photos/id/63/400/300"}
                  alt={meal.name}
                  className="meal-image"
                />
                <div className="meal-info">
                  <div className="macros">
                    <p>Protein = {meal.protein}g</p>
                    <p>Fat = {meal.fat}g</p>
                    <p>Carbs = {meal.carbs}g</p>
                    <p>Calories = {meal.calories}</p>
                    <p className="added">
                      Added:{" "}
                      {new Date(meal.loggedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      if (meal.source === "manual" || !meal.source) {
                        navigate(`/manual-meal?edit=${meal.id}`);
                      } else {
                        navigate(`/editmeal/${meal.id}`);
                      }
                    }}
                  >
                    <Pencil />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <NavBar />
    </div>
  );
}
