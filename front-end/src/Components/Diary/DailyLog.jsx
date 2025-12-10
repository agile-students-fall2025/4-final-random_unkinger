import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../NavBar/NavBar";

const Pencil = () => <span className="text-sm">✏️</span>;

const API = process.env.REACT_APP_API_URL || "http://localhost:5050";

export default function DailyLog() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [activities, setActivities] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date) return;

    const token = localStorage.getItem("token");
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch meals and activities for this date in parallel // NEW
        const [mealsRes, activitiesRes] = await Promise.all([
          fetch(`${API}/api/meals?date=${date}`, { headers }),
          fetch(`${API}/api/activities?date=${date}`, { headers }),
        ]);

        const mealsJson = await mealsRes.json().catch(() => ({}));
        const activitiesJson = await activitiesRes.json().catch(() => []);

        setMeals(mealsJson.meals || []);
        setActivities(Array.isArray(activitiesJson) ? activitiesJson : []);

      } catch (err) {
        console.error("Error fetching daily data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const formattedDate =
    date &&
    new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex items-center justify-center dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
        <div className="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-sm">
          Loading daily log…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex flex-col dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="px-4 sm:px-6 pt-4 pb-3 border-b border-emerald-100/70 bg-white/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/diary")}
            className="inline-flex items-center justify-center rounded-full border border-emerald-100 bg-white/90 px-2.5 py-1.5 shadow-sm hover:bg-emerald-50 text-emerald-700 transition "
            aria-label="Back to diary"
            type="button"
          >
            <i className="ri-arrow-left-line text-lg" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Diary
            </span>
            <h1 className="text-sm font-semibold text-emerald-900 mt-1">
              Daily log
            </h1>
          </div>
          {/* Spacer */}
          <div className="w-9" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-24 space-y-4">
        {/* Date + summary card */}
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-800 shadow-sm"
            >
              <span className="mr-1.5">
                <i className="ri-calendar-line text-sm align-middle" />
              </span>
              <span>{formattedDate || "Selected day"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            <div className="rounded-2xl border border-emerald-50 bg-emerald-50/70 px-3 py-2">
              <p className="text-[11px] font-medium text-emerald-800 uppercase tracking-[0.14em]">
                Calories
              </p>
              <p className="mt-1 text-base font-semibold text-emerald-900">
                {totals.calories}
              </p>
              <p className="text-[11px] text-slate-500">kcal</p>
            </div>
            <div className="rounded-2xl border border-sky-50 bg-sky-50/70 px-3 py-2">
              <p className="text-[11px] font-medium text-sky-800 uppercase tracking-[0.14em]">
                Carbs
              </p>
              <p className="mt-1 text-base font-semibold text-sky-900">
                {totals.carbs}
              </p>
              <p className="text-[11px] text-slate-500">g</p>
            </div>
            <div className="rounded-2xl border border-indigo-50 bg-indigo-50/70 px-3 py-2">
              <p className="text-[11px] font-medium text-indigo-800 uppercase tracking-[0.14em]">
                Protein
              </p>
              <p className="mt-1 text-base font-semibold text-indigo-900">
                {totals.protein}
              </p>
              <p className="text-[11px] text-slate-500">g</p>
            </div>
            <div className="rounded-2xl border border-amber-50 bg-amber-50/70 px-3 py-2">
              <p className="text-[11px] font-medium text-amber-800 uppercase tracking-[0.14em]">
                Fat
              </p>
              <p className="mt-1 text-base font-semibold text-amber-900">
                {totals.fat}
              </p>
              <p className="text-[11px] text-slate-500">g</p>
            </div>
          </div>
        </section>

        {/* Meals list card */}
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <i
                className="ri-restaurant-fill text-lg text-emerald-500"
                aria-hidden="true"
              />
              <h2 className="text-sm font-semibold text-emerald-900">
                Logged meals
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">
              {meals.length} {meals.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {meals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-100 bg-emerald-50/60 px-3 py-4 text-center">
              <p className="text-xs text-slate-600">
                No meals logged for this day yet.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Go back to Home to add a meal, then revisit this diary entry.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <div
                  key={meal.id || meal._id}
                  className="rounded-2xl border border-emerald-50 bg-emerald-50/50 p-3 flex flex-col gap-2"
                >
                  {/* Name + source tag */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 border border-emerald-100 text-[11px] font-medium text-emerald-700">
                        🍽
                      </span>
                      <p className="text-sm font-semibold text-emerald-900">
                        {meal.name}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                        meal.source === "scanned"
                          ? "bg-sky-50 text-sky-800 border-sky-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {meal.source === "scanned" ? "Scanned" : "Manual"}
                    </span>
                  </div>

                  {/* Image + info */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-20 w-24 sm:h-24 sm:w-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center">
                        {meal.image ? (
                          <img
                            src={meal.image}
                            alt={meal.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium text-center px-1">
                            No Image
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-700">
                        <p>
                          <span className="font-medium">Protein:</span>{" "}
                          {meal.protein} g
                        </p>
                        <p>
                          <span className="font-medium">Fat:</span>{" "}
                          {meal.fat} g
                        </p>
                        <p>
                          <span className="font-medium">Carbs:</span>{" "}
                          {meal.carbs} g
                        </p>
                        <p>
                          <span className="font-medium">Calories:</span>{" "}
                          {meal.calories}
                        </p>
                        <p className="col-span-2 text-slate-500">
                          <span className="font-medium">Added:</span>{" "}
                          {meal.loggedAt &&
                            new Date(meal.loggedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </p>
                      </div>

                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-emerald-800 shadow-sm hover:bg-emerald-50 transition"
                          onClick={() => {
                            navigate(`/manual-meal?edit=${meal.id}&returnTo=${date}`);
                          }}
                        >
                          <Pencil />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Activities list card */}
                <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <i
                className="ri-run-line text-lg text-emerald-500"
                aria-hidden="true"
              />
              <h2 className="text-sm font-semibold text-emerald-900">
                Logged activities
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">
              {activities.length} {activities.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-100 bg-emerald-50/60 px-3 py-4 text-center">
              <p className="text-xs text-slate-600">
                No activities logged for this day yet.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Use the Activity Tracking page to log movement for this day.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id || activity._id}
                  className="rounded-2xl border border-emerald-50 bg-emerald-50/50 p-3 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 border border-emerald-100 text-[11px] font-medium text-emerald-700">
                        🏃
                      </span>
                      <p className="text-sm font-semibold text-emerald-900">
                        {activity.name}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                      <i className="ri-time-line text-[13px]" />
                      {(activity.timeMinutes ?? activity.time ?? 0)} min
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 mt-1">
                    {activity.notes && (
                      <span className="inline-flex items-center gap-1">
                        <i className="ri-edit-box-line text-[13px]" />
                        {activity.notes}
                      </span>
                    )}

                    {(activity.loggedAt || activity.createdAt) && (
                      <span className="inline-flex items-center gap-1">
                        <i className="ri-calendar-line text-[13px]" />
                        {new Date(
                          activity.loggedAt || activity.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-emerald-800 shadow-sm hover:bg-emerald-50 transition"
                      onClick={() => navigate("/tracking")} // or "/activity-tracking", whatever your route is
                    >
                      <Pencil />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <NavBar />
    </div>
  );
}