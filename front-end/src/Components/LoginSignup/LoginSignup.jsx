import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignup.css";

const LoginSignup = () => {
  const [action, setAction] = useState("Login"); // a state variable
  const navigate = useNavigate();

  return (
    <div>
      <div className="welcome-text">Welcome to NutriLens!</div>
      <div className="container">
        <div className="header">
          <div className="text">{action}</div>{" "}
          {/* action is either Sign Up or Login */}
          <div className="underline"></div>
        </div>
        <div className="inputs">
          {action === "Login" ? (
            <div></div>
          ) : (
            <div className="input">
              <i className="ri-user-fill"></i>
              <input type="text" placeholder="username" />
            </div>
          )}
          <div className="input">
            <i className="ri-mail-fill"></i>
            <input type="email" placeholder="email" />
          </div>
          <div className="input">
            <i className="ri-lock-fill"></i>
            <input type="password" placeholder="password" />
          </div>
        </div>
        {action === "Sign Up" ? (
          <div></div>
        ) : (
          <div className="forgot-password">
            Forgot Password? <span>Click Here!</span>
          </div>
        )}
        <div className="submit-container">
          <div
            className={action === "Login" ? "submit gray" : "submit"}
            onClick={() => {
              setAction("Sign Up");
            }}
          >
            Sign Up
          </div>{" "}
          {/* If the user is on the Login view, make the Sign Up button gray (inactive).
Otherwise, when the user is on the Sign Up view, show it normally. */}
          <div
            className={action === "Sign Up" ? "submit gray" : "submit"}
            onClick={() => {
              if (action === "Login") {
                navigate("/home");
              } else {
                setAction("Login");
              }
            }}
          >
            Login
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
