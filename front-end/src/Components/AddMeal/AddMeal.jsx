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

  const handleManualClick = () => {
    navigate("/manual-meal");
  };

  return (
    <div className="add-meal-page">
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
        <button onClick={handleSearchClick} className="action-button action-button--search">
          <i className="ri-search-line action-icon"></i>
          <span>Search Product</span>
        </button>

        <button onClick={handleScanClick} className="action-button action-button--scan">
          <i className="ri-qr-scan-line action-icon"></i>
          <span>Scan Product</span>
        </button>

        <button onClick={handleManualClick} className="action-button action-button--manual">
          <i className="ri-edit-box-line action-icon"></i>
          <span>Enter Manually</span>
        </button>
      </div>
      <NavBar />
    </div>
  );
};

export default AddMeal;
