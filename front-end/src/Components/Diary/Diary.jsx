import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Diary.css";

export default function Diary() {
  const navigate=useNavigate();
  const today=new Date();
  const [month,setMonth]=useState(today.getMonth());
  const [year,setYear]=useState(today.getFullYear());

  const months=[
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const years=Array.from({ length:16 }, (_, i) => 2010 + i);
  const firstDay=new Date(year,month, 1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();

  const days=[];
  for (let i=0;i< firstDay;i++) days.push("");
  for (let d=1;d<= daysInMonth; d++) days.push(d);

  return (
    <div className="diary-container">
      <header className="header">Diary</header>

      <main className="content">
        <div className="month-bar">
          <button onClick={() => setMonth(month === 0 ? 11 : month - 1)}>‹</button>
          <div>
            <h2>{months[month]} {year}</h2>

          </div>
          <button onClick={() => setMonth(month === 11 ? 0 : month + 1)}>›</button>
        </div>

        <div className="calendar">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => (
            <div key={day} className="weekday">{day}</div>
          ))}

          {days.map((day, index) => (
            <div
              key={index}
              className={`day-cell ${day ? "clickable" : ""}`}
              onClick={() => day && navigate("/")}
            >
              {day}
            </div>
          ))}
        </div>
      </main>


    </div>
  );
}
