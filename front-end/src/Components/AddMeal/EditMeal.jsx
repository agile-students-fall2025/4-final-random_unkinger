import React, { useState } from "react";
import "./EditMeal.css";

const EditMeal = () => {
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("gram");

  const handleAdd = () => {
    console.log("add clicked");
  };

  return (
    <div className="edit-item-page">
      <div className="edit-item-container">
        <div className="header">
          <div className="text">Food Item Name</div>
          <div className="underline"></div>
        </div>
        <p className="food-brand">FOOD BRAND</p>
        <p className="food-grams">100 gram</p>
        <div className="food-image">
          <span>Food Image</span>
        </div>

        <p className="food-calories">000 kcal / 000 g</p>
        <div className="nutrient-tables">
          <div className="nutrient-table">
            <h4>Carbs</h4>
            <p>00g</p>
          </div>
          <div className="nutrient-table">
            <h4>Fat</h4>
            <p>00g</p>
          </div>
          <div className="nutrient-table">
            <h4>Protein</h4>
            <p>00g</p>
          </div>
        </div>

        <div className="nutrition-info-container">
          <h3 className="nutrition-info-header">Nutrition Information</h3>
          <div className="quantity-unit-inputs">
            <div className="input">
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="input">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="unit-select"
              >
                <option value="gram">gram</option>
                <option value="oz">oz</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>
          <button className="submit" onClick={handleAdd}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMeal;
