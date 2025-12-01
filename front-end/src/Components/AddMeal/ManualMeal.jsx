import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../LoginSignup/LoginSignup.css";
import "./ManualMeal.css";
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
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5050";
  const [form, setForm] = useState(initialForm);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) {
      setError(null);
    }
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

        const response = await fetch(`${API_BASE}/api/meals`, {
          headers,
        });
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

        // Check if there's an edit parameter in the URL
        const editId = searchParams.get("edit");
        if (editId) {
          const mealToEdit = meals.find((meal) => meal.id === Number(editId));
          if (mealToEdit) {
            setForm({
              name: mealToEdit.name || "",
              calories: mealToEdit.calories || "",
              carbs: mealToEdit.carbs || "",
              protein: mealToEdit.protein || "",
              fat: mealToEdit.fat || "",
              notes: mealToEdit.notes || "",
            });
            setEditingId(mealToEdit.id);
            setSearchParams({});
            setTimeout(() => {
              const formElement = document.querySelector(".manual-meal-form");
              if (formElement) {
                formElement.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 100);
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

    if (!form.name.trim()) {
      return;
    }

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
        setError("You must be logged in to save meals. Please log in and try again.");
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
        throw new Error(errorData.error || `Failed to save meal (${response.status})`);
      }

      const result = await response.json();
      console.log("✅ Meal saved successfully:", result);
      const { meal } = result;

      setEntries((prev) => {
        if (!editingId) {
          return [meal, ...prev];
        }
        return prev.map((item) => (item.id === meal.id ? meal : item));
      });
      setForm(initialForm);
      setEditingId(null);
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

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        carbs: acc.carbs + item.carbs,
        protein: acc.protein + item.protein,
        fat: acc.fat + item.fat,
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
  }, [entries]);

  const formatTimestamp = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return isoString;
    }
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
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleDelete = async (mealId) => {
    const meal = entries.find((item) => item.id === mealId);
    if (!meal) {
      return;
    }

    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(`Remove "${meal.name}" from your manual meals?`);

    if (!confirmed) {
      return;
    }

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
    <div className="manual-meal-page">
      <div className="header">
        <button
          onClick={() => navigate(-1)}
          className="back-button"
          aria-label="Back"
        >
          <i className="ri-arrow-left-line"></i>
        </button>
        <div className="text">Enter Meal Manually</div>
        <div className="underline"></div>
      </div>

      {error && <div className="manual-error">{error}</div>}

        <form className="manual-meal-form" onSubmit={handleSubmit}>
          <div className="manual-field">
            <label htmlFor="name">Meal name *</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="E.g., Chicken Salad"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="manual-grid">
            <div className="manual-field">
              <label htmlFor="calories">Calories (kcal)</label>
              <input
                id="calories"
                name="calories"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={form.calories}
                onChange={handleChange}
              />
            </div>
            <div className="manual-field">
              <label htmlFor="carbs">Carbs (g)</label>
              <input
                id="carbs"
                name="carbs"
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={form.carbs}
                onChange={handleChange}
              />
            </div>
            <div className="manual-field">
              <label htmlFor="protein">Protein (g)</label>
              <input
                id="protein"
                name="protein"
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={form.protein}
                onChange={handleChange}
              />
            </div>
            <div className="manual-field">
              <label htmlFor="fat">Fat (g)</label>
              <input
                id="fat"
                name="fat"
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={form.fat}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="manual-field">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              placeholder="Cooking method, ingredients, serving details..."
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit manual-submit">
            {saving ? "Saving..." : editingId ? "Update Meal" : "Log Meal"}
          </button>
          {editingId && (
            <button
              type="button"
              className="manual-cancel"
              onClick={cancelEditing}
              disabled={saving}
            >
              Cancel Edit
            </button>
          )}
        </form>

        {loading ? (
          <div className="manual-loading">Loading your manual meals…</div>
        ) : (
          entries.length > 0 && (
            <section className="manual-summary">
              <h3 className="manual-summary-title">Meals Logged Today</h3>
              <div className="manual-summary-totals">
                <div>
                  <span>Total Calories</span>
                  <strong>{totals.calories} kcal</strong>
                </div>
                <div>
                  <span>Carbs</span>
                  <strong>{totals.carbs} g</strong>
                </div>
                <div>
                  <span>Protein</span>
                  <strong>{totals.protein} g</strong>
                </div>
                <div>
                  <span>Fat</span>
                  <strong>{totals.fat} g</strong>
                </div>
              </div>

              <ul className="manual-meal-list">
                {entries.map((item) => (
                  <li key={item.id} className="manual-meal-card">
                    <div className="manual-meal-card-header">
                      <h4>{item.name}</h4>
                      <div className="manual-meal-meta">
                        {editingId === item.id && (
                          <span className="manual-editing-pill">Editing</span>
                        )}
                        <time>{formatTimestamp(item.loggedAt)}</time>
                      </div>
                    </div>
                    <div className="manual-meal-macros">
                      <span>
                        <strong>{item.calories}</strong> kcal
                      </span>
                      <span>
                        <strong>{item.carbs}</strong> g carbs
                      </span>
                      <span>
                        <strong>{item.protein}</strong> g protein
                      </span>
                      <span>
                        <strong>{item.fat}</strong> g fat
                      </span>
                    </div>
                    {item.notes && (
                      <p className="manual-meal-notes">{item.notes}</p>
                    )}
                    <div className="manual-meal-actions">
                      <button
                        type="button"
                        className="manual-edit-btn"
                        onClick={() => startEditing(item)}
                        disabled={saving && editingId === item.id}
                      >
                        <i className="ri-edit-line" aria-hidden="true"></i>
                        Edit meal
                      </button>
                      <button
                        type="button"
                        className="manual-delete-btn"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        <i
                          className="ri-delete-bin-6-line"
                          aria-hidden="true"
                        ></i>
                        {deletingId === item.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        )}

      <NavBar />
    </div>
  );
};

export default ManualMeal;
