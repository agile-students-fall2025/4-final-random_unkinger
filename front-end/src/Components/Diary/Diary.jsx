import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const goPrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex flex-col dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="px-4 sm:px-6 pt-4 pb-3 border-b border-emerald-100/70 bg-white/60 backdrop-blur-md">
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
            NutriLens
          </span>
          <h1 className="mt-1 text-sm font-semibold text-emerald-900">
            Diary
          </h1>
          <span className="mt-2 h-1 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-lime-400" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 pt-4 pb-24 space-y-4">
        {/* Month selector card */}
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={goPrevMonth}
              className="inline-flex items-center justify-center rounded-full border border-emerald-100 bg-white/90 h-8 w-8 text-emerald-700 shadow-sm hover:bg-emerald-50 transition"
              aria-label="Previous month"
            >
              <span className="text-lg leading-none">‹</span>
            </button>

            <div className="flex flex-col items-center">
              <h2 className="text-sm font-semibold text-emerald-900">
                {months[month]} {year}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tap a day to view your log.
              </p>
            </div>

            <button
              type="button"
              onClick={goNextMonth}
              className="inline-flex items-center justify-center rounded-full border border-emerald-100 bg-white/90 h-8 w-8 text-emerald-700 shadow-sm hover:bg-emerald-50 transition"
              aria-label="Next month"
            >
              <span className="text-lg leading-none">›</span>
            </button>
          </div>

          {/* Optional: year dropdown (if you want it visible) */}
          {/* 
          <div className="mt-2 flex justify-center">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-full px-3 py-1 outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          */}
        </section>

        {/* Calendar card */}
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5">
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-[11px] font-medium text-slate-500 text-center uppercase tracking-[0.12em]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, index) => {
              const isSelected = selectedDay === day;
              const isToday =
                day &&
                year === today.getFullYear() &&
                month === today.getMonth() &&
                day === today.getDate();

              const baseClasses =
                "flex items-center justify-center text-sm rounded-xl h-9 sm:h-10 cursor-pointer transition";
              const emptyClasses = "h-9 sm:h-10";
              const selectedClasses =
                "bg-emerald-500 text-white font-semibold shadow-sm ring-2 ring-emerald-300";
              const todayClasses =
                "border border-emerald-300 text-emerald-800 bg-emerald-50";
              const defaultClasses =
                "bg-slate-50 text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-100";

              if (!day) {
                return <div key={index} className={emptyClasses} />;
              }

              let cls = baseClasses + " " + defaultClasses;
              if (isToday && !isSelected) cls = baseClasses + " " + todayClasses;
              if (isSelected) cls = baseClasses + " " + selectedClasses;

              return (
                <button
                  key={index}
                  type="button"
                  className={cls}
                  onClick={() => handleDayClick(day)}
                >
                  <span className="leading-none">{day}</span>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      <NavBar />
    </div>
  );
}
