import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// You can remove this now if you're not using the old CSS anymore:
// import "./LoginSignup.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5050";

const LoginSignup = () => {
  const [action, setAction] = useState("Login"); // "Login" or "Sign Up"
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleReset = () => {
    if (!resetEmail.trim()) {
      alert("Please enter a valid email address.");
      return;
    }
    alert(`Reset link sent to ${resetEmail} (mock).`);
    setShowReset(false);
    setResetEmail("");
  };

  const handleLoginClick = async () => {
    // If we're in Sign Up mode, clicking "Login" just switches the view back
    if (action === "Sign Up") {
      setAction("Login");
      return;
    }

    // Actual login logic (Login mode)
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      alert("Unexpected error during login.");
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      alert("Please fill out username, email, and password.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Registration failed.");
        return;
      }

      alert("Account created! You can now log in.");
      setAction("Login");
      setPassword("");
    } catch (err) {
      console.error("Register error:", err);
      alert("Unexpected error during sign up.");
    }
  };

  const handleSignUpClick = () => {
    if (action === "Login") {
      setAction("Sign Up");
    } else {
      handleRegister();
    }
  };

  return (
    <div className=" min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-50 via-white to-lime-50 dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-5xl grid gap-10 md:grid-cols-[1.1fr,1fr] items-center">
        {/* Left: brand / marketing panel */}
        <div className="hidden md:flex flex-col gap-5 pr-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/70 px-3 py-1 w-fit text-sm font-medium text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Nutrition tracking, made gentle
          </div>

          <h1 className="text-4xl lg:text-5xl font-semibold text-emerald-900 leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">
              NutriLens
            </span>
            .
          </h1>

          <p className="text-slate-600 dark:text-slate-100 text-base leading-relaxed max-w-md">
            Log your meals, notice your patterns, and build a healthier routine—
            without obsessing over numbers. NutriLens keeps things clear, calm,
            and easy.
          </p>

          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-100">
            <li className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Track meals and mood in one place
            </li>
            <li className="flex items-center gap-2 dark:text-slate-100">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              See gentle trends instead of harsh metrics
            </li>
            <li className="flex items-center gap-2 dark:text-slate-100">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Designed to feel light, not clinical
            </li>
          </ul>
        </div>

        {/* Right: auth card */}
        <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-md border border-emerald-100 shadow-xl rounded-3xl p-8">
          {/* Small welcome for mobile */}
          <div className="mb-4 md:hidden">
            <h1 className="text-2xl font-semibold text-emerald-900">
              Welcome to NutriLens
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {showReset
                ? "Reset your password to get back on track."
                : "Log in or create an account to start tracking."}
            </p>
          </div>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-emerald-900">
                  {showReset
                    ? "Forgot your password?"
                    : action === "Login"
                    ? "Log in to your account"
                    : "Create your account"}
                </h2>
                {!showReset && (
                  <p className="text-xs text-slate-500 mt-1">
                    {action === "Login"
                      ? "Welcome back! Let’s pick up where you left off."
                      : "A few quick details to get you started."}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-lime-400" />
          </div>

          {/* Forgot password view */}
          {showReset ? (
            <div className="space-y-5">
              <p className="text-sm text-slate-600">
                Please enter the email address you&apos;d like your password
                reset information sent to:
              </p>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">
                  Email address
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                  <i className="ri-mail-fill text-slate-400 text-lg" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              <button
                className="w-full mt-4 inline-flex justify-center items-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition"
                onClick={handleReset}
              >
                Request reset link
              </button>

              <button
                type="button"
                className="mt-2 text-xs text-slate-500 hover:text-emerald-600 inline-flex items-center gap-1"
                onClick={() => {
                  setShowReset(false);
                  setAction("Login");
                }}
              >
                <span className="text-base">←</span> Back to login
              </button>
            </div>
          ) : (
            <>
              {/* Inputs */}
              <div className="space-y-4">
                {action === "Sign Up" && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600">
                      Username
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                      <i className="ri-user-fill text-slate-400 text-lg" />
                      <input
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600">
                    Email
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                    <i className="ri-mail-fill text-slate-400 text-lg" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600">
                    Password
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
                    <i className="ri-lock-fill text-slate-400 text-lg" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Forgot password link (only in Login mode) */}
              {action === "Login" && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-emerald-600"
                    onClick={() => setShowReset(true)}
                  >
                    Forgot password? <span>Reset here</span>
                  </button>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex gap-3">
                  {/* Sign Up */}
                  <button
                    type="button"
                    onClick={handleSignUpClick}
                    className={`flex-1 inline-flex justify-center items-center rounded-xl border px-4 py-2.5 text-sm font-medium transition
                    ${
                      action === "Sign Up"
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm hover:bg-emerald-600"
                        : "bg-white text-emerald-700 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {action === "Sign Up" ? "Create account" : "Sign up"}
                  </button>

                  {/* Login */}
                  <button
                    type="button"
                    onClick={handleLoginClick}
                    className={`flex-1 inline-flex justify-center items-center rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition
                    ${
                      action === "Login"
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {action === "Login" ? "Log in" : "Back to login"}
                  </button>
                </div>

                {/* Small helper text */}
                <p className="text-[11px] text-slate-500 text-center mt-1">
                  By continuing, you agree to let NutriLens gently analyze your
                  meal patterns to support healthier habits over time.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
