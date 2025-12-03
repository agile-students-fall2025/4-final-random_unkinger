import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
      const todayStr = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

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
  const caloriePercentage =
    calorieGoal > 0
      ? Math.min(100, (caloriesConsumed / calorieGoal) * 100)
      : 0;

  const carbsGoal = Math.round((calorieGoal * 0.5) / 4);
  const fatGoal = Math.round((calorieGoal * 0.3) / 9);

  const carbsPercentage =
    carbsGoal > 0 ? Math.min(100, (carbsConsumed / carbsGoal) * 100) : 0;
  const proteinPercentage =
    proteinGoal > 0
      ? Math.min(100, (proteinConsumed / proteinGoal) * 100)
      : 0;
  const fatPercentage =
    fatGoal > 0 ? Math.min(100, (fatConsumed / fatGoal) * 100) : 0;

  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (caloriePercentage / 100) * circumference;

  const macroRadius = 18;
  const macroCircumference = 2 * Math.PI * macroRadius;

  const carbsOffset =
    macroCircumference - (carbsPercentage / 100) * macroCircumference;
  const proteinOffset =
    macroCircumference - (proteinPercentage / 100) * macroCircumference;
  const fatOffset =
    macroCircumference - (fatPercentage / 100) * macroCircumference;

  const handleAddActivity = () => navigate("/tracking");
  const handleAddMeal = () => navigate("/add-meal");

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex flex-col dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-2 border-b border-emerald-100/60 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <img
            src="/Logo.png"
            alt="NutriLens logo"
            className="h-8 w-8 rounded-xl object-contain"
          />
          <span className="text-lg font-semibold tracking-tight text-emerald-900">
            NutriLens
          </span>
        </div>
        <div className="hidden sm:flex flex-col items-end text-xs text-slate-500">
          <span className="uppercase tracking-[0.16em] text-[11px]">
            Today
          </span>
          <span className="font-medium text-slate-700">{formattedDate}</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-24 pt-4 space-y-5">
        {/* Small date label for mobile */}
        <h2 className="sm:hidden text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          Today,{" "}
          <span className="normal-case font-normal tracking-normal">
            {formattedDate}
          </span>
        </h2>

        {/* Goal reminder card */}
        <div className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5">
          <GoalReminder
            calorieGoal={calorieGoal}
            caloriesConsumed={caloriesConsumed}
            proteinGoal={proteinGoal}
            proteinConsumed={proteinConsumed}
            loading={loading}
          />
        </div>

        {/* Main dashboard grid */}
        <div className="grid gap-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
          {/* Calorie ring + macro info */}
          <div className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-emerald-700 uppercase tracking-[0.16em]">
                  Daily overview
                </p>
                <p className="text-sm text-slate-500">
                  {loading
                    ? "Loading today’s summary..."
                    : "Here’s where you’re at today."}
                </p>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {Math.round(caloriesConsumed)} kcal eaten
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 w-full mt-2">
              {/* Calorie circle */}
              <div className="relative flex items-center justify-center">
                <svg width="160" height="160">
                  {/* background circle */}
                  <circle
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="transparent"
                    r={radius}
                    cx="80"
                    cy="80"
                  />
                  {/* progress circle */}
                  <circle
                    stroke="#22C55E"
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
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-semibold text-emerald-900">
                    {loading ? "..." : Math.round(caloriesLeft)}
                  </p>
                  <p className="text-xs text-slate-500">kcal left</p>
                </div>
              </div>

              {/* Macro rings */}
              <div className="flex-1 w-full">
                <p className="text-xs font-medium text-slate-600 mb-3">
                  Macros so far
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {/* Carbs */}
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center mb-1">
                      <svg width="40" height="40">
                        <circle
                          stroke="#E5E7EB"
                          strokeWidth="3"
                          fill="transparent"
                          r={macroRadius}
                          cx="20"
                          cy="20"
                        />
                        <circle
                          stroke="#22C55E"
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
                      <div className="absolute text-[11px] font-medium text-emerald-900">
                        {loading ? "..." : Math.round(carbsConsumed)}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 text-center leading-tight">
                      {loading
                        ? "..."
                        : `${Math.round(carbsConsumed)}/${carbsGoal} g`}
                      <br />
                      <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                        Carbs
                      </span>
                    </p>
                  </div>

                  {/* Fat */}
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center mb-1">
                      <svg width="40" height="40">
                        <circle
                          stroke="#E5E7EB"
                          strokeWidth="3"
                          fill="transparent"
                          r={macroRadius}
                          cx="20"
                          cy="20"
                        />
                        <circle
                          stroke="#22C55E"
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
                      <div className="absolute text-[11px] font-medium text-emerald-900">
                        {loading ? "..." : Math.round(fatConsumed)}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 text-center leading-tight">
                      {loading
                        ? "..."
                        : `${Math.round(fatConsumed)}/${fatGoal} g`}
                      <br />
                      <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                        Fat
                      </span>
                    </p>
                  </div>

                  {/* Protein */}
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center mb-1">
                      <svg width="40" height="40">
                        <circle
                          stroke="#E5E7EB"
                          strokeWidth="3"
                          fill="transparent"
                          r={macroRadius}
                          cx="20"
                          cy="20"
                        />
                        <circle
                          stroke="#22C55E"
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
                      <div className="absolute text-[11px] font-medium text-emerald-900">
                        {loading ? "..." : Math.round(proteinConsumed)}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 text-center leading-tight">
                      {loading
                        ? "..."
                        : `${Math.round(proteinConsumed)}/${proteinGoal} g`}
                      <br />
                      <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                        Protein
                      </span>
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                  Carbs and fat goals are based on your calorie goal:
                  <br />
                  <span className="font-medium text-slate-600">
                    50% from carbs (4 kcal/g), 30% from fat (9 kcal/g).
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick actions card */}
          <div className="space-y-4">
            {/* Activity */}
            <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <i className="ri-run-line text-lg text-emerald-500" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-emerald-900">
                    Activity
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Add a quick movement session to keep your day balanced.
              </p>
              <button
                className="w-full inline-flex justify-center items-center gap-1 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition"
                onClick={handleAddActivity}
              >
                <span className="text-base">＋</span> Quick Add Activity
              </button>
            </section>

            {/* Meals */}
            <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <i
                    className="ri-restaurant-fill text-lg text-emerald-500"
                    aria-hidden="true"
                  />
                  <h3 className="text-sm font-semibold text-emerald-900">
                    Meals
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Log what you&apos;ve eaten today—no judgment, just patterns.
              </p>
              <button
                className="w-full inline-flex justify-center items-center gap-1 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition"
                onClick={handleAddMeal}
              >
                <span className="text-base">＋</span> Quick Add Meal
              </button>
            </section>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <NavBar />
    </div>
  );
}