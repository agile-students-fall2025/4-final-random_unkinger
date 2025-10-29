import React from "react";
import "./DailyLog.css";

// Simple pencil emoji instead of lucide-react icon
const Pencil = () => <span style={{ fontSize: "14px" }}>✏️</span>;

const mockMeals = [
  { id: 1, image: "https://picsum.photos/id/63/5000/2813", time: "08:30 AM" },
  { id: 2, image: "https://picsum.photos/id/63/5000/2813", time: "12:45 PM" },
  { id: 3, image: "https://picsum.photos/id/63/5000/2813", time: "06:10 PM" },
  { id: 4, image: "https://picsum.photos/id/63/5000/2813", time: "09:00 PM" },
];

export default function DailyLog() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="dailylog-container">
      <header className="header">
        <div className="text">Diary</div>
        <div className="underline"></div>
      </header>

      <main className="content">
        <button className="date-btn">
          Date: {formattedDate}
        </button>

        <div className="meal-list">
          {mockMeals.map((meal) => (
            <div className="meal-card" key={meal.id}>
              <img src={meal.image} alt="Meal" className="meal-image" />
              <div className="meal-info">
                <div className="macros">
                  <p>Protein = 1%</p>
                  <p>Fat = 2%</p>
                  <p>Carbs = 10%</p>
                  <p>Calories = 100</p>
                  <p className="added">Added: {meal.time}</p>
                </div>
                <button className="edit-btn">
                  <Pencil />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
