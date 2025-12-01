import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../LoginSignup/LoginSignup.css";
import "./ActivityTracking.css";
import NavBar from "../NavBar/NavBar";

const API = process.env.REACT_APP_API_URL || "http://localhost:5050";

const ActivityTracking = () => {
  const [form, setForm] = useState({
    name: "",
    time: "",
    notes: "",
  });

  const [activities, setActivities] = useState([]);
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
        const res = await fetch(`${API}/api/activities`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
      const res = await fetch(`${API}/api/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          time,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        const msg =
          json.error ||
          (json.errors && json.errors[0]?.msg) ||
          "Failed to save activity.";
        alert(msg);
        return;
      }

      const newActivity = {
        id: json._id,
        name: json.name,
        time: String(json.timeMinutes),
        notes: json.notes || "",
        date: json.date
          ? new Date(json.date).toLocaleDateString()
          : todayLabel,
      };

      setActivities((prev) => [...prev, newActivity]);
      setForm({ name: "", time: "", notes: "" });
    } catch (err) {
      console.error("Error creating activity:", err);
      alert("Unexpected error creating activity.");
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
      const res = await fetch(`${API}/api/activities/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const todaysActivities = activities.filter(
    (a) => a.date === todayLabel
  );

  const totalTimeToday = todaysActivities.reduce(
    (sum, activity) => sum + parseInt(activity.time || "0", 10),
    0
  );

  return (
    <div className="activity-page">
      <div className="header">
        <button
          onClick={() => navigate(-1)}
          className="back-button"
          aria-label="Back"
        >
          <i className="ri-arrow-left-line"></i>
        </button>
        <div className="text">Activity Tracking</div>
        <div className="underline"></div>
      </div>

      <form onSubmit={handleSubmit} className="activity-form">
        <div className="input">
          <i className="ri-run-line"></i>
          <input
            type="text"
            name="name"
            placeholder="Activity name (e.g., Running, Swimming)"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input">
          <i className="ri-time-line"></i>
          <input
            type="number"
            name="time"
            placeholder="Duration (minutes)"
            value={form.time}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="input">
          <i className="ri-edit-box-line"></i>
          <input
            type="text"
            name="notes"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit submit--add">
          Add Activity
        </button>
      </form>

      <div className="activities-list">
        <h3 className="list-header">Today's Activities</h3>
        {todaysActivities.length === 0 ? (
          <div className="empty-state">
            <p>No activities logged yet for today. Start tracking your activities!</p>
          </div>
        ) : (
          <div className="activities">
            {todaysActivities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="activity-info">
                  <div className="activity-name">
                    <i className="ri-checkbox-circle-line"></i>
                    {activity.name}
                  </div>
                  <div className="activity-details">
                    <span className="activity-time">
                      <i className="ri-time-line"></i>
                      {activity.time} min
                    </span>
                    {activity.notes && (
                      <span className="activity-notes">
                        <i className="ri-edit-box-line"></i>
                        {activity.notes}
                      </span>
                    )}
                    <span className="activity-date">
                      <i className="ri-calendar-line"></i>
                      {activity.date}
                    </span>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(activity.id)}
                  aria-label="Delete activity"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {todaysActivities.length > 0 && (
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-label">Total Activities Today:</span>
            <span className="stat-value">{todaysActivities.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Time Today:</span>
            <span className="stat-value">{totalTimeToday} min</span>
          </div>
        </div>
      )}

      <NavBar />
    </div>
  );
};

export default ActivityTracking;
