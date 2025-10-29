import React, { useState } from "react";
import "./DailyLog.css";
import Diary from "../Diary/Diary"; 


const Pencil = () => <span style={{ fontSize: "14px" }}>✏️</span>;

const mockMeals = [
  { id: 1, image: "https://picsum.photos/200", time: "08:30 AM" },
  { id: 2, image: "https://picsum.photos/200", time: "12:45 PM" },
  { id: 3, image: "https://picsum.photos/200", time: "06:10 PM" },
  { id: 4, image: "https://picsum.photos/200", time: "09:00 PM" },
];

export default function DailyLog() {

  const [showDiary, setShowDiary] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

 
  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });


  if (showDiary) {
    return (
      <Diary
        currentDate={selectedDate}
        onDateSelect={(newDate) => {
          setSelectedDate(newDate);
          setShowDiary(false);
        }}
      />
    );
  }

  // --- otherwise render daily log view ---
  return (
    <div className="dailylog-container">
      <header className="header">
        <div className="text">Diary</div>
        <div className="underline"></div>
      </header>

      <main className="content">
        {/* Clicking this opens Diary */}
        <button className="date-btn" onClick={() => setShowDiary(true)}>
          Date: {formattedDate}
        </button>

        <div className="meal-list">
          {mockMeals.map((meal) => (
            <div className="meal-card" key={meal.id}>
              <img src={meal.image} alt="Meal" className="meal-image" />
              <div className="meal-info">
                <div className="macros">
                  <p>Protein = 00%</p>
                  <p>Fat = 00%</p>
                  <p>Carbs = 00%</p>
                  <p>Calories = 000</p>
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
