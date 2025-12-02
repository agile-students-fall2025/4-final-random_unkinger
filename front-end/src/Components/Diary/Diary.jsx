import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../LoginSignup/LoginSignup.css";
import "./Diary.css";
import NavBar from "../NavBar/NavBar";

export default function Diary() {
  const navigate = useNavigate();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - 10 + i);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push("");
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const handleDayClick = (day) => {
    if (!day) return;
    setSelectedDay(day);

    const localDate = new Date(year, month, day);
    const selectedDate = `${localDate.getFullYear()}-${String(
      localDate.getMonth() + 1
    ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;

    navigate(`/dailylog/${selectedDate}`);
  };

  return (
    <div className="diary-container">
      <header className="header">
        <div className="text">Diary</div>
        <div className="underline"></div>
      </header>

      <main className="content">
        <div className="month-bar">
          <button onClick={() => setMonth(month === 0 ? 11 : month - 1)}>
            ‹
          </button>
          <div>
            <h2>
              {months[month]} {year}
            </h2>
          </div>
          <button onClick={() => setMonth(month === 11 ? 0 : month + 1)}>
            ›
          </button>
        </div>

        <div className="calendar">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <div
              key={index}
              className={`day-cell ${day ? "clickable" : ""} ${
                selectedDay === day ? "selected" : ""
              }`}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </div>
          ))}
        </div>
      </main>

      <NavBar />
    </div>
  );
}
