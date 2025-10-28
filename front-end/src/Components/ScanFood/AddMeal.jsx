import React from "react";
import "../LoginSignup/LoginSignup.css";
import "./AddMeal.css";

const AddMeal = () => {
    // TODO : 
    const handleSearchClick = () => {
        console.log("update later to go to search page")
    }

    const handleScanClick = () =>{
        console.log("update later to go to scan page")
    }

  return (
    <div className="add-meal-page">
      <div className="container">
        <div className="header">
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
    </div>
  );
};

export default AddMeal;
