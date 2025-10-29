import React from "react";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import "./DailyLog.css";

const mockMeals = [
  { id: 1,image:"https://picsum.photos/200",time:"08:30 AM" },
  { id: 2,image:"https://picsum.photos/200",time:"12:45 PM" },
  { id: 3,image:"https://picsum.photos/200",time:"06:10 PM" },
  { id: 4,image:"https://picsum.photos/200",time:"09:00 PM" },
];

export default function DailyLog() {
  const navigate=useNavigate();

  return (
    <div className="dailylog-container">

      <header className="header">
        <div className="text">Diary</div>
        <div className="underline"></div>
      </header>

      <main className="content">
        <button className="date-btn" onClick={()=> navigate("/diary")}>
          Date: Day, 00-00-0000
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
                  <Pencil size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>


    </div>
  );
}
