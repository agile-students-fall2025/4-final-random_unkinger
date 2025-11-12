import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DailyLog.css";
import NavBar from "../NavBar/NavBar";

const Pencil = () => <span style={{ fontSize: "14px" }}>✏️</span>;

export default function DailyLog() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date) return;

    fetch(`http://localhost:5050/api/macros/summary?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Summary:", data);
        setSummary(data);
      })
      .catch((err) => console.error("Error fetching summary:", err));

    fetch(`http://localhost:5050/api/meals?date=${date}`)
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
            Most Protein: {summary?.mostProtein?.name} (
            {summary?.mostProtein?.value}g)
          </p>
          <p>
            Most Carbs: {summary?.mostCarbs?.name} ({summary?.mostCarbs?.value}
            g)
          </p>
          <p>
            Most Fat: {summary?.mostFat?.name} ({summary?.mostFat?.value}g)
          </p>
        </div>

        <div className="meal-list">
          {meals.map((meal) => (
            <div className="meal-card" key={meal.id}>
              <div className="meal-name">{meal.name}</div>
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
                    onClick={() => navigate(`/editmeal/${meal.id}`)}
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
