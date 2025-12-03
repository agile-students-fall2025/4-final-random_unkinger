import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EditMeal.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5050";

const EditMeal = () => {
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("gram");
  const navigate = useNavigate();
  const location = useLocation();
  const [foodData, setFoodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

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

  // Convert quantity to grams based on unit
  const convertToGrams = (qty, unitType) => {
    const qtyNum = parseFloat(qty) || 0;
    if (qtyNum <= 0) return 0;

    switch (unitType) {
      case "gram":
        return qtyNum;
      case "oz":
        return qtyNum * 28.35; // 1 oz = 28.35g
      case "lbs":
        return qtyNum * 453.592; // 1 lb = 453.592g
      case "amount":
        // For "amount", assume 1 unit = 100g (standard serving)
        return qtyNum * 100;
      default:
        return qtyNum;
    }
  };

  // Calculate adjusted nutrition based on quantity
  const calculateAdjustedNutrition = () => {
    if (!foodData || !quantity) {
      return {
        calories: foodData?.calories || 0,
        protein: foodData?.protein || 0,
        carbs: foodData?.carbs || 0,
        fat: foodData?.fat || 0,
      };
    }

    const quantityInGrams = convertToGrams(quantity, unit);
    const multiplier = quantityInGrams / 100; // Nutrition is per 100g

    return {
      calories: Math.round((foodData.calories || 0) * multiplier),
      protein: Math.round(((foodData.protein || 0) * multiplier) * 10) / 10,
      carbs: Math.round(((foodData.carbs || 0) * multiplier) * 10) / 10,
      fat: Math.round(((foodData.fat || 0) * multiplier) * 10) / 10,
    };
  };

  const handleAdd = async () => {
    if (!foodData) {
      setSaveError("No food data available");
      return;
    }

    const qty = parseFloat(quantity);
    if (!quantity || qty <= 0) {
      setSaveError("Please enter a valid quantity");
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSaveError("Not authenticated. Please log in again.");
        navigate("/");
        return;
      }

      const adjustedNutrition = calculateAdjustedNutrition();
      const quantityInGrams = convertToGrams(quantity, unit);

      const mealData = {
        name: foodData.name,
        calories: adjustedNutrition.calories,
        carbs: adjustedNutrition.carbs,
        protein: adjustedNutrition.protein,
        fat: adjustedNutrition.fat,
        source: "scanned",
        image: foodData.imageUrl || "",
        notes: `${quantity} ${unit} (${Math.round(quantityInGrams)}g)`,
      };

      const res = await fetch(`${API}/api/meals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mealData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save meal (${res.status})`);
      }

      const data = await res.json();
      console.log("Meal saved successfully:", data);

      // Navigate to home after successful save
      navigate("/home");
    } catch (err) {
      console.error("Error saving meal:", err);
      setSaveError(err.message || "Failed to save meal. Please try again.");
      setSaving(false);
    }
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

        <p className="food-calories">
          {foodData?.calories || "0"} kcal / 100g
          {quantity && parseFloat(quantity) > 0 && (
            <span className="adjusted-calories">
              {" "}
              ({calculateAdjustedNutrition().calories} kcal for {quantity} {unit})
            </span>
          )}
        </p>
        <div className="nutrient-tables">
          <div className="nutrient-table">
            <h4>Carbs</h4>
            <p>
              {quantity && parseFloat(quantity) > 0
                ? `${calculateAdjustedNutrition().carbs}g`
                : `${foodData?.carbs || "0"}g`}
            </p>
          </div>
          <div className="nutrient-table">
            <h4>Fat</h4>
            <p>
              {quantity && parseFloat(quantity) > 0
                ? `${calculateAdjustedNutrition().fat}g`
                : `${foodData?.fat || "0"}g`}
            </p>
          </div>
          <div className="nutrient-table">
            <h4>Protein</h4>
            <p>
              {quantity && parseFloat(quantity) > 0
                ? `${calculateAdjustedNutrition().protein}g`
                : `${foodData?.protein || "0"}g`}
            </p>
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
          {saveError && (
            <div className="error-message" style={{ color: "#ff6b6b", marginBottom: "10px" }}>
              {saveError}
            </div>
          )}
          <button className="submit" onClick={handleAdd} disabled={saving}>
            {saving ? "Saving..." : "Add to Diary"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMeal;