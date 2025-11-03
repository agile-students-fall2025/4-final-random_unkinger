import React from "react";
import { useNavigate } from "react-router-dom";

import "./Home.css";

const Home = ({ user }) => {
  const today = new Date();
  const options = { weekday: "long", month: "short", day: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", options);
  const navigator = useNavigate();

  const handleAddActivity = () => {
    navigator("/tracking");
  };

  const handleAddMeal = () => {
    navigator("/add-meal");
  };

  return (
    <div className="home-container">
      <header className="header">
        <img src="/Logo.png" alt="NutriLens logo" className="logo-img" />
        <span className="app-name">NutriLens</span>
      </header>

      <main className="content">
        <h2 className="date">TODAY, {formattedDate}</h2>

        <div className="calorie-circle">
          <div className="circle">
            <div className="circle-text">
              <p className="kcal">1200</p>
              <p>kcal left</p>
            </div>
          </div>
        </div>

        <div className="macros">
          <div className="macro">
            <div className="macro-ring"></div>
            <p>x/xxx g carbs</p>
          </div>
          <div className="macro">
            <div className="macro-ring"></div>
            <p>x/xxx g fat</p>
          </div>
          <div className="macro">
            <div className="macro-ring"></div>
            <p>x/xxx g protein</p>
          </div>
        </div>

        <section className="activity">
          <div className="section-header">
            <i className="ri-run-line icon"></i>
            <h3>Activity</h3>
          </div>
          <button className="add-btn" onClick={handleAddActivity}>
            + Quick Add Activity
          </button>
        </section>

        <section className="meal">
          <div className="section-header">
            <i className="ri-restaurant-fill icon"></i>
            <h3>Meals</h3>
          </div>
          <button className="add-btn" onClick={handleAddMeal}>
            + Quick Add Meal
          </button>
        </section>
      </main>
    </div>
  );
};

export default Home;
