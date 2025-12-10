import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar/NavBar";
const API = process.env.REACT_APP_API_URL || "";

const ActivityTracking = () => {
  const [form, setForm] = useState({
    name: "",
    time: "",
    notes: "",
  });

  const [activities, setActivities] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  const todayLabel = new Date().toLocaleDateString();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found; redirecting to login.");
      navigate("/");
      return;
    }

    (async () => {
      try {
        const headers = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(`${API}/api/activities`, {
          headers,
        });

        if (!res.ok) {
          console.error("Failed to load activities, status:", res.status);
          return;
        }

        const data = await res.json();
        const mapped = data.map((a) => ({
          id: a._id,
          name: a.name,
          time: String(a.timeMinutes),
          notes: a.notes || "",
          date: a.date
            ? new Date(a.date).toLocaleDateString()
            : new Date(a.createdAt || Date.now()).toLocaleDateString(),
        }));
        setActivities(mapped);
      } catch (err) {
        console.error("Error loading activities:", err);
      }
    })();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, time, notes } = form;

    if (!name || !time) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to add activities.");
      navigate("/");
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const isEditing = !!editingId;
      const url = isEditing
        ? `${API}/api/activities/${editingId}`
        : `${API}/api/activities`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          name,
          time,
          notes,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          json.error ||
          (json.errors && json.errors[0]?.msg) ||
          "Failed to save activity.";
        alert(msg);
        return;
      }

      const saved = {
        id: json._id || json.id,
        name: json.name || name,
        time: String(json.timeMinutes || time),
        notes: json.notes || notes || "",
        date: json.date ? new Date(json.date).toLocaleDateString() : todayLabel,
      };

      setActivities((prev) => {
        if (!isEditing) {
          return [...prev, saved];
        }
        return prev.map((a) => (a.id === saved.id ? saved : a));
      });

      setForm({ name: "", time: "", notes: "" });
      setEditingId(null);
    } catch (err) {
      console.error("Error creating/updating activity:", err);
      alert("Unexpected error saving activity.");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to delete activities.");
      navigate("/");
      return;
    }

    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API}/api/activities/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error || "Failed to delete activity.");
        return;
      }

      setActivities((prev) => prev.filter((activity) => activity.id !== id));
    } catch (err) {
      console.error("Error deleting activity:", err);
      alert("Unexpected error deleting activity.");
    }
  };

  const handleEditClick = (activity) => {
    setForm({
      name: activity.name,
      time: activity.time,
      notes: activity.notes || "",
    });
    setEditingId(activity.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const todaysActivities = activities.filter((a) => a.date === todayLabel);
  const totalTimeToday = todaysActivities.reduce(
    (sum, activity) => sum + parseInt(activity.time || "0", 10),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex flex-col dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <header className="px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between border-b border-emerald-100/70 bg-white/60 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center rounded-full border border-emerald-100 bg-white/90 px-2.5 py-1.5 shadow-sm hover:bg-emerald-50 transition text-emerald-700"
          aria-label="Back"
          type="button"
        >
          <i className="ri-arrow-left-line text-lg" />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-sm font-semibold tracking-[0.18em] uppercase text-emerald-800">
            Activity Tracking
          </h1>
          <span className="mt-1 h-1 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-lime-400" />
        </div>

        <div className="w-9" />
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-24 pt-4 space-y-5">
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-emerald-900">
                Log a new activity
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Track movement, however small—walks, stretching, dancing, and
                more.
              </p>
            </div>
            <span className="hidden sm:inline-flex text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              {todayLabel}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Activity name
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                <i className="ri-run-line text-slate-400 text-lg" />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Walking, Yoga, Dance session"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Duration (minutes)
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                <i className="ri-time-line text-slate-400 text-lg" />
                <input
                  type="number"
                  name="time"
                  min="1"
                  placeholder="How long did you move?"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Notes (optional)
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                <i className="ri-edit-box-line text-slate-400 text-lg" />
                <input
                  type="text"
                  name="notes"
                  placeholder="How did it feel? Any details you want to remember."
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              <button
                type="submit"
                className="flex-1 inline-flex justify-center items-center gap-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition"
              >
                <span className="text-base">＋</span>
                {editingId ? "Save Changes" : "Add Activity"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ name: "", time: "", notes: "" });
                  }}
                  className="inline-flex justify-center items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {}
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <i
                className="ri-checkbox-circle-line text-lg text-emerald-500"
                aria-hidden="true"
              />
              <h3 className="text-sm font-semibold text-emerald-900">
                Today&apos;s Activities
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              {todaysActivities.length} logged
            </span>
          </div>

          {todaysActivities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-100 bg-emerald-50/40 px-3 py-4 text-center">
              <p className="text-xs text-slate-600">
                No activities logged yet for today.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Start with a short walk, a stretch, or any gentle movement.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-1">
              {todaysActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-50 bg-emerald-50/40 px-3 py-2.5"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <i className="ri-checkbox-circle-line text-emerald-500 text-base" />
                      <span className="text-sm font-medium text-emerald-900">
                        {activity.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <i className="ri-time-line text-[13px]" />
                        {activity.time} min
                      </span>

                      {activity.notes && (
                        <span className="inline-flex items-center gap-1">
                          <i className="ri-edit-box-line text-[13px]" />
                          {activity.notes}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1">
                        <i className="ri-calendar-line text-[13px]" />
                        {activity.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-emerald-100 bg-white/80 p-1.5 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition"
                      onClick={() => handleEditClick(activity)}
                      aria-label="Edit activity"
                      type="button"
                    >
                      <i className="ri-pencil-line text-[15px]" />
                    </button>

                    <button
                      className="inline-flex items-center justify-center rounded-full border border-red-100 bg-white/80 p-1.5 text-red-500 hover:bg-red-50 hover:border-red-200 transition"
                      onClick={() => handleDelete(activity.id)}
                      aria-label="Delete activity"
                      type="button"
                    >
                      <i className="ri-delete-bin-line text-[15px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {todaysActivities.length > 0 && (
          <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-emerald-900 mb-3">
              Today&apos;s Summary
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-emerald-50 bg-emerald-50/60 px-3 py-2.5">
                <p className="text-[11px] font-medium text-emerald-800 uppercase tracking-[0.16em]">
                  Total activities
                </p>
                <p className="mt-1 text-lg font-semibold text-emerald-900">
                  {todaysActivities.length}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-50 bg-emerald-50/60 px-3 py-2.5">
                <p className="text-[11px] font-medium text-emerald-800 uppercase tracking-[0.16em]">
                  Total time
                </p>
                <p className="mt-1 text-lg font-semibold text-emerald-900">
                  {totalTimeToday} min
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
      <NavBar />
    </div>
  );
};

export default ActivityTracking;
