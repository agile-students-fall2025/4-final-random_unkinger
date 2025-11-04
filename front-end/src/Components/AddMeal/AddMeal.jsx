import React from "react";
import { useNavigate } from "react-router-dom";
import "../LoginSignup/LoginSignup.css";
import "./AddMeal.css";
import NavBar from "../NavBar/NavBar";

const AddMeal = () => {
  const navigate = useNavigate();

  // TODO :
  const handleSearchClick = () => {
    navigate("/search");
  };

  const handleScanClick = () => {
    navigate("/scan-meal");
  };

  return (
    <div className="add-meal-page">
      <div className="container">
        <div className="header">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
            aria-label="Back"
          >
            <i className="ri-arrow-left-line"></i>
          </button>
          <div className="text">Quick Add Meal</div>
          <div className="underline"></div>
        </div>
        <div className="add-meal-options">
          <button onClick={handleSearchClick} className="action-button">
            <span>Search Product</span>
          </button>

          <button onClick={handleScanClick} className="action-button">
            <span>Scan Product</span>
          </button>
        </div>
      </div>
      <NavBar />
    </div>
  );
};

export default AddMeal;
