import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../LoginSignup/LoginSignup.css";
import "./ActivityTracking.css";
import NavBar from "../NavBar/NavBar";

const ActivityTracking = () => {
  const [form, setForm] = useState({
    name: "",
    time: "",
    notes: "",
  });

  const [activities, setActivities] = useState([]);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.time) {
      const newActivity = {
        id: Date.now(),
        ...form,
        date: new Date().toLocaleDateString(),
      };
      setActivities([...activities, newActivity]);
      setForm({ name: "", time: "", notes: "" });
    }
  };

  const handleDelete = (id) => {
    setActivities(activities.filter((activity) => activity.id !== id));
  };

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
          {activities.length === 0 ? (
            <div className="empty-state">
              <p>No activities logged yet. Start tracking your activities!</p>
            </div>
          ) : (
            <div className="activities">
              {activities.map((activity) => (
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

        {activities.length > 0 && (
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-label">Total Activities:</span>
              <span className="stat-value">{activities.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Time:</span>
              <span className="stat-value">
                {activities.reduce(
                  (sum, activity) => sum + parseInt(activity.time || 0),
                  0
                )}{" "}
                min
              </span>
            </div>
          </div>
        )}

      <NavBar />
    </div>
  );
};

export default ActivityTracking;
