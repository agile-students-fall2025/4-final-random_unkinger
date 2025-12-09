import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found, redirecting to login.");
      navigate("/");
      return;
    }

    async function loadProfile() {
      try {
        const headers = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(`${API}/api/profile`, {
          headers,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        setForm((f) => ({
          ...f,
          name: data.name ?? f.name,
          age:
            data.age !== undefined && data.age !== null
              ? String(data.age)
              : f.age,
          heightCm:
            data.heightCm !== undefined && data.heightCm !== null
              ? String(data.heightCm)
              : f.heightCm,
          weightKg:
            data.weightKg !== undefined && data.weightKg !== null
              ? String(data.weightKg)
              : f.weightKg,
          activity: data.activity ?? f.activity,
          calorieGoal:
            data.calorieGoal !== undefined && data.calorieGoal !== null
              ? String(data.calorieGoal)
              : f.calorieGoal,
          proteinGoal:
            data.proteinGoal !== undefined && data.proteinGoal !== null
              ? String(data.proteinGoal)
              : f.proteinGoal,
          avatarUrl: data.avatarUrl ?? f.avatarUrl,
        }));
      } 
      catch (err) {
        console.error("Failed to load profile:", err);
      }
    }

    loadProfile();
  }, 
  [navigate]);

  const bmi = useMemo(() => {
    const h = parseFloat(form.heightCm);
    const w = parseFloat(form.weightKg);
    if (!h || !w) return "";
    const m = h / 100;
    const v = w / (m * m);
    return Number.isFinite(v) ? v.toFixed(1) : "";
  }, 
  [form.heightCm, form.weightKg]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  const onAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setForm((f) => ({
        ...f,
        avatarUrl: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
  };
  

  const onLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const onSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to save your profile.");
      navigate("/");
      return;
    }

    try {
      const res = await fetch(`${API}/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      console.log("Saved:", json);

      if (!res.ok) {
        const msg =
          json.error ||
          (json.errors && json.errors[0]?.msg) ||
          "Unknown error saving profile.";
        alert("Failed to save profile: " + msg);
      } else {
        alert("Profile saved!");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Unexpected error saving profile.");
    }
  };

  return (
    <div className=" min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-50 via-white to-lime-50 dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <header className="px-4 sm:px-6 pt-4 pb-3 border-b border-emerald-100/70 bg-white/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Profile
            </span>
            <h1 className="text-sm font-semibold text-emerald-900 mt-1">
              {form.name || "Your Profile"}
            </h1>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-full border border-red-100 bg-white/90 px-3 py-1.5 text-[11px] font-medium text-red-500 shadow-sm hover:bg-red-50 hover:border-red-200 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-24 space-y-5">
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
          <div className="relative">
          {form.avatarUrl ? (
          <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-emerald-100 shadow-sm bg-slate-100">
            <img
              src={form.avatarUrl}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-20 w-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-[11px] text-emerald-900 text-center">
            Profile
            <br />
            Picture
          </div>
        )}
      </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                {form.name || "Name not set"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Update your basic info and goals to personalize NutriLens.
              </p>
              {bmi && (
                <p className="mt-2 text-xs text-emerald-700 font-medium">
                  BMI:{" "}
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] border border-emerald-100">
                    {bmi}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="sm:ml-auto">
            <label className="inline-flex items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-800 shadow-sm hover:bg-emerald-100 cursor-pointer transition">
              <span>Change photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                className="hidden"
              />
            </label>
          </div>
        </section>

        {/* Form card */}
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-emerald-900 mb-3">
            Personal details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Name
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                <input
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handle}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                BMI
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <input
                  type="text"
                  value={bmi}
                  placeholder="—"
                  disabled
                  aria-label="Body Mass Index"
                  className="w-full bg-transparent text-sm text-slate-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Age
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                <input
                  name="age"
                  type="number"
                  min="0"
                  placeholder="Years"
                  value={form.age}
                  onChange={handle}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Height
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                <input
                  name="heightCm"
                  type="number"
                  min="0"
                  placeholder="cm"
                  value={form.heightCm}
                  onChange={handle}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Weight
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                <input
                  name="weightKg"
                  type="number"
                  min="0"
                  placeholder="kg"
                  value={form.weightKg}
                  onChange={handle}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Activity level
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                <select
                  name="activity"
                  value={form.activity}
                  onChange={handle}
                  aria-label="Activity level"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly active</option>
                  <option value="moderate">Moderately active</option>
                  <option value="active">Active</option>
                  <option value="very_active">Very active</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Calorie goal
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                <input
                  name="calorieGoal"
                  type="number"
                  min="0"
                  placeholder="kcal/day"
                  value={form.calorieGoal}
                  onChange={handle}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                Protein goal
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                <input
                  name="proteinGoal"
                  type="number"
                  min="0"
                  placeholder="g/day"
                  value={form.proteinGoal}
                  onChange={handle}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition"
            >
              Save profile
            </button>
          </div>
        </section>
      </main>

      <NavBar />
    </div>
  );
}