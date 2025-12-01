import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignup.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5050";

const LoginSignup = () => {
  const [action, setAction] = useState("Login");
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
    if (action === "Login") {
      if (!email.trim()) {
        alert("Please enter your email.");
        return;
      }

      try {
        const res = await fetch(`${API}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
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
    } else {
      setAction("Login");
    }
  };

  const handleSignUpClick = () => {
    if (action === "Login") {
      setAction("Sign Up");
    } else {

      setAction("Login");
    }
  };

  return (
    <div>
      <div className="welcome-text">Welcome to NutriLens!</div>

      <div className="container">
        <div className="header">
          <div className="text">
            {showReset ? "Forgot your password" : action}
          </div>
          <div className="underline"></div>
        </div>

        {}
        {showReset ? (
          <div className="forgot-container">
            <p className="forgot-paragraph">
              Please enter the email address you'd like your password reset
              information sent to:
            </p>
            <div className="input">
              <i className="ri-mail-fill"></i>
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>

            <button className="submit" onClick={handleReset}>
              Request reset link
            </button>

            <div
              className="back-link"
              onClick={() => {
                setShowReset(false);
                setAction("Login");
              }}
            >
              ← Back To Login
            </div>
          </div>
        ) : (

          <>
            <div className="inputs">
              {action === "Login" ? (
                <div></div>
              ) : (
                <div className="input">
                  <i className="ri-user-fill"></i>
                  <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}
              <div className="input">
                <i className="ri-mail-fill"></i>
                <input
                  type="email"
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input">
                <i className="ri-lock-fill"></i>
                <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {action === "Sign Up" ? (
              <div></div>
            ) : (
              <div className="forgot-password">
                Forgot Password?{" "}
                <span onClick={() => setShowReset(true)}>Click Here!</span>
              </div>
            )}

            <div className="submit-container">
              <div
                className={action === "Login" ? "submit gray" : "submit"}
                onClick={handleSignUpClick}
              >
                Sign Up
              </div>
              <div
                className={action === "Sign Up" ? "submit gray" : "submit"}
                onClick={handleLoginClick}
              >
                Login
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
