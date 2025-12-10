import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "../NavBar/NavBar";

const initialForm = {
  name: "",
  calories: "",
  carbs: "",
  protein: "",
  fat: "",
  notes: "",
};

const ManualMeal = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const API_BASE = process.env.REACT_APP_API_URL || "";

  const [form, setForm] = useState(initialForm);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [returnTo, setReturnTo] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        const response = await fetch(`${API_BASE}/api/meals?date=${todayStr}`, { headers });

        if (!response.ok) {
          throw new Error(`Failed to load meals (${response.status})`);
        }

        const data = await response.json();
        const meals = Array.isArray(data.meals) ? data.meals : [];

        setEntries(
          meals.map((meal) => ({
            ...meal,
            loggedAt: meal.loggedAt,
          }))
        );

        // handle ?edit=<id> from query string
        const editId = searchParams.get("edit");
        const returnToDate = searchParams.get("returnTo");
        if (returnToDate) {
          setReturnTo(returnToDate);
        }
        if (editId) {
          const mealToEdit = meals.find((meal) => meal.id === editId);
          if (mealToEdit) {
            setForm({
              name: mealToEdit.name || "",
              calories: mealToEdit.calories?.toString() || "",
              carbs: mealToEdit.carbs?.toString() || "",
              protein: mealToEdit.protein?.toString() || "",
              fat: mealToEdit.fat?.toString() || "",
              notes: mealToEdit.notes || "",
            });
            setEditingId(mealToEdit.id);
            // Clear query params but preserve returnTo in state
            const newParams = new URLSearchParams();
            if (returnToDate) {
              newParams.set("returnTo", returnToDate);
            }
            setSearchParams(newParams);

            setTimeout(() => {
              const el = document.querySelector("#manual-meal-form");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 100);
          }
        } else {
          // prefill from search page params
          const name = searchParams.get("name");
          if (name) {
            const round = (val) =>
              val ? Math.round(Number(val)).toString() : "";
            setForm({
              name: name || "",
              calories: round(searchParams.get("calories")),
              carbs: round(searchParams.get("carbs")),
              protein: round(searchParams.get("protein")),
              fat: round(searchParams.get("fat")),
              notes: "",
            });
            // clearing so refreshing doesnt re-trigger
            setSearchParams({});
          }
        }
      } catch (err) {
        console.error(err);
        setError(
          "We couldn't load your manual meals. Please try again shortly."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [API_BASE, searchParams, setSearchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        calories: form.calories ? Number(form.calories) : undefined,
        carbs: form.carbs ? Number(form.carbs) : undefined,
        protein: form.protein ? Number(form.protein) : undefined,
        fat: form.fat ? Number(form.fat) : undefined,
        notes: form.notes.trim(),
        source: "manual",
      };

      const endpoint = editingId
        ? `${API_BASE}/api/meals/${editingId}`
        : `${API_BASE}/api/meals`;
      const method = editingId ? "PUT" : "POST";

      const token = localStorage.getItem("token");
      if (!token) {
        setError(
          "You must be logged in to save meals. Please log in and try again."
        );
        setSaving(false);
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      console.log("📤 Sending meal data:", { endpoint, method, payload });

      const response = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Meal save failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.error || `Failed to save meal (${response.status})`
        );
      }

      const result = await response.json();
      console.log("✅ Meal saved successfully:", result);
      const { meal } = result;

      setEntries((prev) => {
        if (!editingId) {
          // prepend new meal
          return [meal, ...prev];
        }
        // update existing
        return prev.map((item) => (item.id === meal.id ? meal : item));
      });

      setForm(initialForm);
      const wasEditing = !!editingId;
      setEditingId(null);
      
      // If we came from diary and were editing, navigate back to diary
      if (wasEditing && returnTo) {
        navigate(`/dailylog/${returnTo}`);
        return;
      }
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Something went wrong saving your meal. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const totals = useMemo(
    () =>
      entries.reduce(
        (acc, item) => ({
          calories: acc.calories + (item.calories || 0),
          carbs: acc.carbs + (item.carbs || 0),
          protein: acc.protein + (item.protein || 0),
          fat: acc.fat + (item.fat || 0),
        }),
        { calories: 0, carbs: 0, protein: 0, fat: 0 }
      ),
    [entries]
  );

  const formatTimestamp = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleString();
  };

  const startEditing = (meal) => {
    setEditingId(meal.id);
    setForm({
      name: meal.name || "",
      calories: meal.calories?.toString() || "",
      carbs: meal.carbs?.toString() || "",
      protein: meal.protein?.toString() || "",
      fat: meal.fat?.toString() || "",
      notes: meal.notes || "",
    });
    const el = document.querySelector("#manual-meal-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleDelete = async (mealId) => {
    const meal = entries.find((item) => item.id === mealId);
    if (!meal) return;

    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(`Remove "${meal.name}" from your manual meals?`);

    if (!confirmed) return;

    setDeletingId(mealId);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/meals/${mealId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const message = await response.json().catch(() => ({}));
        throw new Error(message.error || "Failed to delete meal.");
      }

      const { meal: deletedMeal } = await response.json();
      setEntries((prev) =>
        prev.filter((item) => item.id !== (deletedMeal?.id ?? mealId))
      );

      if (editingId === mealId) {
        cancelEditing();
      }
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Something went wrong deleting your meal. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex flex-col dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="px-4 sm:px-6 pt-4 pb-3 border-b border-emerald-100/70 bg-white/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (returnTo) {
                navigate(`/dailylog/${returnTo}`);
              } else {
                navigate(-1);
              }
            }}
            className="inline-flex items-center justify-center rounded-full border border-emerald-100 bg-white/90 px-2.5 py-1.5 shadow-sm hover:bg-emerald-50 text-emerald-700 transition"
            aria-label="Back"
            type="button"
          >
            <i className="ri-arrow-left-line text-lg" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              NutriLens
            </span>
            <h1 className="mt-1 text-sm font-semibold text-emerald-900">
              Enter meal manually
            </h1>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-24 space-y-4">
        {error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-800 shadow-sm">
            {error}
          </div>
        )}

        {/* Form card */}
        <section
          id="manual-meal-form"
          className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5 space-y-4"
        >
          <div>
            <p className="text-sm font-semibold text-emerald-900">Log a meal</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Add nutrition details for homemade dishes or foods without
              barcodes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium text-slate-700"
              >
                Meal name <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="E.g., Chicken salad with quinoa"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              />
            </div>

            {/* Grid macros */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="calories"
                  className="text-xs font-medium text-slate-700"
                >
                  Calories (kcal)
                </label>
                <input
                  id="calories"
                  name="calories"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={form.calories}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="carbs"
                  className="text-xs font-medium text-slate-700"
                >
                  Carbs (g)
                </label>
                <input
                  id="carbs"
                  name="carbs"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={form.carbs}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="protein"
                  className="text-xs font-medium text-slate-700"
                >
                  Protein (g)
                </label>
                <input
                  id="protein"
                  name="protein"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={form.protein}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="fat"
                  className="text-xs font-medium text-slate-700"
                >
                  Fat (g)
                </label>
                <input
                  id="fat"
                  name="fat"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={form.fat}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label
                htmlFor="notes"
                className="text-xs font-medium text-slate-700"
              >
                Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Cooking method, ingredients, portion size..."
                value={form.notes}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition"
              >
                {saving ? "Saving..." : editingId ? "Update meal" : "Log meal"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Summary + list */}
        {loading ? (
          <div className="rounded-2xl border border-emerald-100 bg-white/80 px-3.5 py-3 text-xs text-slate-600 shadow-sm">
            Loading your manual meals…
          </div>
        ) : (
          entries.length > 0 && (
            <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-emerald-900">
                    Today's meals
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Meals you've logged today. View past meals in your diary.
                  </p>
                </div>
                <span className="text-[11px] text-slate-500">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-2xl border border-emerald-50 bg-emerald-50/80 px-3 py-2">
                  <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-[0.14em]">
                    Calories
                  </span>
                  <p className="mt-1 text-base font-semibold text-emerald-900">
                    {totals.calories}
                  </p>
                  <p className="text-[11px] text-slate-500">kcal</p>
                </div>
                <div className="rounded-2xl border border-sky-50 bg-sky-50/80 px-3 py-2">
                  <span className="text-[11px] font-medium text-sky-800 uppercase tracking-[0.14em]">
                    Carbs
                  </span>
                  <p className="mt-1 text-base font-semibold text-sky-900">
                    {totals.carbs}
                  </p>
                  <p className="text-[11px] text-slate-500">g</p>
                </div>
                <div className="rounded-2xl border border-indigo-50 bg-indigo-50/80 px-3 py-2">
                  <span className="text-[11px] font-medium text-indigo-800 uppercase tracking-[0.14em]">
                    Protein
                  </span>
                  <p className="mt-1 text-base font-semibold text-indigo-900">
                    {totals.protein}
                  </p>
                  <p className="text-[11px] text-slate-500">g</p>
                </div>
                <div className="rounded-2xl border border-amber-50 bg-amber-50/80 px-3 py-2">
                  <span className="text-[11px] font-medium text-amber-800 uppercase tracking-[0.14em]">
                    Fat
                  </span>
                  <p className="mt-1 text-base font-semibold text-amber-900">
                    {totals.fat}
                  </p>
                  <p className="text-[11px] text-slate-500">g</p>
                </div>
              </div>

              {/* List */}
              <ul className="space-y-3">
                {entries.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 px-3.5 py-3 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </h4>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          {editingId === item.id && (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-100">
                              Editing
                            </span>
                          )}
                          <time className="text-[11px]">
                            {formatTimestamp(item.loggedAt)}
                          </time>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 text-[11px] text-slate-700">
                      <span>
                        <strong>{item.calories ?? 0}</strong> kcal
                      </span>
                      <span>
                        <strong>{item.carbs ?? 0}</strong> g carbs
                      </span>
                      <span>
                        <strong>{item.protein ?? 0}</strong> g protein
                      </span>
                      <span>
                        <strong>{item.fat ?? 0}</strong> g fat
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-600 mt-1">
                        {item.notes}
                      </p>
                    )}

                    <div className="mt-1 flex flex-wrap gap-2 justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-emerald-800 shadow-sm hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        onClick={() => startEditing(item)}
                        disabled={saving && editingId === item.id}
                      >
                        <i className="ri-edit-line text-xs" />
                        Edit meal
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-medium text-rose-800 shadow-sm hover:bg-rose-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        <i className="ri-delete-bin-6-line text-xs" />
                        {deletingId === item.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        )}
      </main>

      <NavBar />
    </div>
  );
};

export default ManualMeal;
