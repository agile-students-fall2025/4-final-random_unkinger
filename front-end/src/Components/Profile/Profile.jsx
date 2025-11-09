import React, { useMemo, useState, useEffect } from "react";
import "../LoginSignup/LoginSignup.css";
import "./Profile.css";
import NavBar from "../NavBar/NavBar";

const API = process.env.REACT_APP_API_URL || "http://localhost:5050";

const initial = {
  name: "",
  age: "",
  heightCm: "",
  weightKg: "",
  activity: "sedentary",
  calorieGoal: "",
  proteinGoal: "",
  avatarUrl: `https://picsum.photos/seed/profile-${Math.floor(
    Math.random() * 1e9
  )}/120/120`,
};

export default function Profile() {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    fetch(`${API}/api/profile`)
      .then((res) => res.json())
      .then((data) => setForm((f) => ({ ...f, ...data })))
      .catch((err) => console.error("Failed to load profile:", err));
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setForm((f) => ({
          ...f,
          name: data.name ?? f.name,
          age: String(data.age ?? f.age),
          heightCm: String(data.heightCm ?? f.heightCm),
          weightKg: String(data.weightKg ?? f.weightKg),
          activity: data.activity ?? f.activity,
          calorieGoal: String(data.calorieGoal ?? f.calorieGoal),
          proteinGoal: String(data.proteinGoal ?? f.proteinGoal),
          avatarUrl: data.avatarUrl ?? f.avatarUrl,
        }));
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }
    loadProfile();
  }, []);

  const bmi = useMemo(() => {
    const h = parseFloat(form.heightCm);
    const w = parseFloat(form.weightKg);
    if (!h || !w) return "";
    const m = h / 100;
    const v = w / (m * m);
    return Number.isFinite(v) ? v.toFixed(1) : "";
  }, [form.heightCm, form.weightKg]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, avatarUrl: url }));
  };

  const onLogout = () => {
    alert("Logged out (demo).");
  };

  const onSave = async () => {
    const res = await fetch(`${API}/api/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    console.log("Saved:", json);
    alert("Profile saved (mock).");
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="header">
          <div className="text">{form.name || "Name"}</div>
          <div className="underline"></div>
        </div>

        <div className="avatar-row">
          <div className="avatar-wrap">
            {form.avatarUrl ? (
              <img className="avatar-img" src={form.avatarUrl} alt="avatar" />
            ) : (
              <div className="avatar-placeholder">Profile{"\n"}Picture</div>
            )}
          </div>
          <label className="avatar-upload">
            <input type="file" accept="image/*" onChange={onAvatarChange} />
            Upload
          </label>
        </div>

        <div className="profile-form">
          <div className="form-row">
            <label className="form-label">Name</label>
            <div className="input profile-input">
              <input
                name="name"
                type="text"
                placeholder=" Your name"
                value={form.name}
                onChange={handle}
              />
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">BMI</label>
            <div className="input profile-input">
              <input
                type="text"
                value={bmi}
                placeholder=" —"
                disabled
                aria-label="Body Mass Index"
              />
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Age</label>
            <div className="input profile-input">
              <input
                name="age"
                type="number"
                placeholder=" e.g., 21"
                value={form.age}
                onChange={handle}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Height</label>
            <div className="input profile-input">
              <input
                name="heightCm"
                type="number"
                placeholder=" cm"
                value={form.heightCm}
                onChange={handle}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Weight</label>
            <div className="input profile-input">
              <input
                name="weightKg"
                type="number"
                placeholder=" kg"
                value={form.weightKg}
                onChange={handle}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Activity</label>
            <div className="input input--select profile-input">
              <select
                name="activity"
                value={form.activity}
                onChange={handle}
                aria-label="Activity level"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light (1-3 days/wk)</option>
                <option value="moderate">Moderate (3-5 days/wk)</option>
                <option value="active">Active (6-7 days/wk)</option>
                <option value="very_active">Very Active (athlete)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Calorie Goal</label>
            <div className="input profile-input">
              <input
                name="calorieGoal"
                type="number"
                placeholder=" kcal/day"
                value={form.calorieGoal}
                onChange={handle}
                min="0"
              />
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Protein Goal</label>
            <div className="input profile-input">
              <input
                name="proteinGoal"
                type="number"
                placeholder=" g/day"
                value={form.proteinGoal}
                onChange={handle}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="submit-container profile-actions">
          <div className="submit submit--sm" onClick={onSave}>
            Save
          </div>
          <div className="submit submit--sm gray" onClick={onLogout}>
            Logout
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );
}
