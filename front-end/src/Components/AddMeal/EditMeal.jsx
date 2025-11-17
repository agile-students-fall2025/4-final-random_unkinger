import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EditMeal.css";

const EditMeal = () => {
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("gram");
  const navigate = useNavigate();
  const location = useLocation();
  const [foodData, setFoodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const barcode = location.state?.barcode;

  useEffect(() => {
    if (barcode) {
      fetchFoodData(barcode);
    } else {
      setLoading(false);
      setError("No barcode provided");
    }
  }, [barcode]);

  const fetchFoodData = async (barcode) => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5050/api/barcode/${barcode}`
      );

      if (res.ok) {
        const data = await res.json();
        setFoodData(data);
      } else {
        const error = await res.json();
        setError(error || "product not found");
      }
    } catch (e) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="edit-item-page">
        <div className="edit-item-container">
          <div className="header">
            <button
              onClick={() => navigate(-1)}
              className="back-button"
              aria-label="Back"
            >
              <i className="ri-arrow-left-line"></i>
            </button>
            <div className="text">Loading...</div>
          </div>

          <div className="loading-spinner">Getting data from barcode...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-item-page">
      <div className="edit-item-container">
        <div className="header">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
            aria-label="Back"
          >
            <i className="ri-arrow-left-line"></i>
          </button>
          <div className="text">{foodData?.name || "Food not found"}</div>
          <div className="underline"></div>
        </div>
        <p className="food-brand">{foodData?.brand}</p>
        <p className="food-grams">100 gram</p>
        <div className="food-image">
          <img
            src={foodData?.imageUrl}
            alt={foodData?.name}
          />
        </div>

        <p className="food-calories">{foodData?.calories || "0"} kcal / 100g</p>
        <div className="nutrient-tables">
          <div className="nutrient-table">
            <h4>Carbs</h4>
            <p>{foodData?.carbs || "0"}g</p>
          </div>
          <div className="nutrient-table">
            <h4>Fat</h4>
            <p>{foodData?.fat || "0"}g</p>
          </div>
          <div className="nutrient-table">
            <h4>Protein</h4>
            <p>{foodData?.protein || "0"} g</p>
          </div>
        </div>

        <div className="nutrition-info-container">
          <h3 className="nutrition-info-header">Adjust Quantity</h3>
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
                <option value="amount">quantity</option>
              </select>
            </div>
          </div>
          <button className="submit" onClick={handleAdd}>
            Add to Diary
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMeal;