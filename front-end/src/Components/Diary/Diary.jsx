import React, { useState } from "react";
import "./Diary.css";

export default function Diary({ currentDate, onDateSelect }) {
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

 
  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };


  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleDayClick = (day) => {
    const newDate = new Date(year, month, day);
    onDateSelect(newDate); 
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push("");
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="diary-container">
      <header className="header">Select a Date</header>
      <main className="content">
        {/* Month/Year Header with Arrows */}
        <div className="month-bar">
          <button onClick={handlePrevMonth} className="arrow-btn">&lt;</button>
          <span className="month-year">
            {months[month]} {year}
          </span>
          <button onClick={handleNextMonth} className="arrow-btn">&gt;</button>
        </div>

        {/* Calendar grid */}
        <div className="calendar">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="weekday">
              {d}
            </div>
          ))}

          {days.map((day, i) => (
            <div
              key={i}
              className={`day-cell ${day ? "clickable" : ""}`}
              onClick={() => day && handleDayClick(day)}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Add Activity Button */}
        <button className="add-btn">+ Add Activity</button>

        {/* Back Button */}
        <button className="back-btn" onClick={() => onDateSelect(currentDate)}>
          ← Back
        </button>
      </main>
    </div>
  );
}
