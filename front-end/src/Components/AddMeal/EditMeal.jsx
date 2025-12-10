import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NavBar from "../NavBar/NavBar";

const API = process.env.REACT_APP_API_URL || "";

const EditMeal = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("gram");
  const navigate = useNavigate();
  const location = useLocation();
  const [foodData, setFoodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);

  const barcode = location.state?.barcode || manualBarcode;

  useEffect(() => {
    if (id) {
      fetchMealData(id);
    } else if (barcode) {
      fetchFoodData(barcode);
    } else {
      setLoading(false);
      setError("No barcode provided.");
    }
  }, [barcode, id]);

  const fetchMealData = async (mealId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to edit meals.");
        setLoading(false);
        return;
      }


      const res = await fetch(`${API}/api/meals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const meal = data.meals.find((m) => m.id === mealId);
        if (meal) {
          setFoodData({
            name: meal.name,
            calories: meal.calories,
            carbs: meal.carbs,
            protein: meal.protein,
            fat: meal.fat,
            imageUrl: meal.image,
            brand: "Generic Meal", // Placeholder
          });
          // TODO: by quatity for now fix later move to backend meal:id no time no write it now due tomorrow i am cooked
          if (meal.notes && meal.notes.startsWith("Quantity: ")) {
            const parts = meal.notes.replace("Quantity: ", "").split(" ");
            if (parts.length >= 2) {
              setQuantity(parts[0]);
              setUnit(parts[1]);
            }
          }
        } else {
          setError("Meal not found.");
        }
      } else {
        setError("Failed to load meal data.");
      }
    } catch (e) {
      console.error("Error fetching meal:", e);
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodData = async (code) => {
    if (!code) {
      setLoading(false);
      setError("No barcode provided.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setShowManualEntry(false);

      const res = await fetch(`${API}/api/barcode/${code}`);

      if (res.ok) {
        const data = await res.json();
        setFoodData(data);
        setShowManualEntry(false);
      } else {
        const errorBody = await res.json().catch(() => ({}));
        setError(errorBody.error || "Product not found in database.");
        setShowManualEntry(true); // Show manual entry option
      }
    } catch (e) {
      console.error("Barcode fetch error:", e);
      setError(
        "Failed to connect to server. Please check your internet connection."
      );
      setShowManualEntry(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualBarcodeSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      fetchFoodData(manualBarcode.trim());
    }
  };

  const handleRetryScan = () => {
    navigate("/scan-meal");
  };

  const handleAdd = async () => {
    if (!foodData) {
      setError("No food data available to save.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError(
          "You must be logged in to save meals. Please log in and try again."
        );
        setSaving(false);
        return;
      }

      // Calculate quantity in grams
      let quantityInGrams = 100; // Default to 100g (one serving from barcode API)

      if (quantity && !isNaN(Number(quantity)) && Number(quantity) > 0) {
        const qty = Number(quantity);
        switch (unit) {
          case "gram":
            quantityInGrams = qty;
            break;
          case "oz":
            quantityInGrams = qty * 28.35; // 1 oz = 28.35g
            break;
          case "lbs":
            quantityInGrams = qty * 453.592; // 1 lb = 453.592g
            break;
          case "amount":
            // For "amount" unit, assume it's a serving size (100g per serving)
            quantityInGrams = qty * 100;
            break;
          default:
            quantityInGrams = qty;
        }
      }

      // Calculate nutritional values based on quantity
      // Barcode API returns values per 100g, so we calculate proportionally
      const multiplier = quantityInGrams / 100;
      let finalCalories, finalCarbs, finalProtein, finalFat;

      if (id) {
        finalCalories = foodData.calories;
        finalCarbs = foodData.carbs;
        finalProtein = foodData.protein;
        finalFat = foodData.fat;
      } else {
        // new scan caculate from 100g base
        finalCalories = Math.round((foodData.calories || 0) * multiplier);
        finalCarbs = Math.round((foodData.carbs || 0) * multiplier * 10) / 10;
        finalProtein = Math.round((foodData.protein || 0) * multiplier * 10) / 10;
        finalFat = Math.round((foodData.fat || 0) * multiplier * 10) / 10;
      }

      const payload = {
        name: foodData.name || "Scanned food",
        calories: finalCalories,
        carbs: finalCarbs,
        protein: finalProtein,
        fat: finalFat,
        notes: quantity && unit ? `Quantity: ${quantity} ${unit}` : "",
        source: "scanned",
        image: foodData.imageUrl || "",
      };

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      let endpoint = `${API}/api/meals`;
      let method = "POST";

      if (id) {
        endpoint = `${API}/api/meals/${id}`;
        method = "PUT";
      }

      console.log("📤 Saving scanned meal:", payload);

      const response = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Meal save failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.error || `Failed to save meal (${response.status})`
        );
      }

      const result = await response.json();
      console.log("✅ Scanned meal saved successfully:", result);

      // Navigate to home after successful save
      navigate("/home");
    } catch (err) {
      console.error("Error saving meal:", err);
      setError(
        err.message ||
          "Something went wrong saving your meal. Please try again."
      );
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex items-center justify-center dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
        <div className="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-sm">
          Getting data from barcode…
        </div>
      </div>
    );
  }

  const name = foodData?.name || "Food not found";
  const brand = foodData?.brand || "Unknown brand";
  const imageUrl = foodData?.imageUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex flex-col dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="px-4 sm:px-6 pt-4 pb-3 border-b border-emerald-100/70 bg-white/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-full border border-emerald-100 bg-white/90 px-2.5 py-1.5 shadow-sm hover:bg-emerald-50 text-emerald-700 transition "
            aria-label="Back"
            type="button"
          >
            <i className="ri-arrow-left-line text-lg" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              NutriLens
            </span>
            <h1 className="mt-1 text-sm font-semibold text-emerald-900">
              {id ? "Edit meal" : "Add scanned meal"}
            </h1>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 pt-4 pb-24 space-y-4">
        {/* Product card */}
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-emerald-900 line-clamp-2">
              {name}
            </p>
            <p className="text-[11px] text-slate-500">{brand}</p>
            {barcode && (
              <p className="text-[10px] text-slate-400">
                Barcode:{" "}
                <span className="font-mono text-slate-600">{barcode}</span>
              </p>
            )}
          </div>

          <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="aspect-[4/3] w-full flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-400 font-medium">
                  No Image
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-emerald-50 bg-emerald-50/70 px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-emerald-800 uppercase tracking-[0.14em]">
                Calories
              </p>
              <p className="mt-1 text-base font-semibold text-emerald-900">
                {foodData?.calories ?? 0} kcal
              </p>
              {!id && <p className="text-[11px] text-slate-500">per 100 g</p>}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-sky-50 bg-sky-50/80 px-3 py-2 text-center">
              <p className="text-[11px] font-medium text-sky-800 uppercase tracking-[0.14em]">
                Carbs
              </p>
              <p className="mt-1 text-sm font-semibold text-sky-900">
                {foodData?.carbs ?? 0} g
              </p>
            </div>
            <div className="rounded-2xl border border-amber-50 bg-amber-50/80 px-3 py-2 text-center">
              <p className="text-[11px] font-medium text-amber-800 uppercase tracking-[0.14em]">
                Fat
              </p>
              <p className="mt-1 text-sm font-semibold text-amber-900">
                {foodData?.fat ?? 0} g
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-50 bg-indigo-50/80 px-3 py-2 text-center">
              <p className="text-[11px] font-medium text-indigo-800 uppercase tracking-[0.14em]">
                Protein
              </p>
              <p className="mt-1 text-sm font-semibold text-indigo-900">
                {foodData?.protein ?? 0} g
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-2 space-y-3">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                {error}
                {error.includes("not found") && (
                  <p className="mt-2 text-[10px] text-amber-700">
                    The product might not be in the OpenFoodFacts database. Try
                    entering the barcode manually or add the meal manually.
                  </p>
                )}
              </div>

              {showManualEntry && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 space-y-2">
                  <p className="text-[11px] font-medium text-emerald-900">
                    Try manual barcode entry
                  </p>
                  <form
                    onSubmit={handleManualBarcodeSubmit}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      placeholder="Enter barcode number"
                      className="flex-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-600 transition"
                    >
                      Lookup
                    </button>
                  </form>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleRetryScan}
                      className="flex-1 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 transition"
                    >
                      Try scanning again
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/manual-meal")}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      Add manually
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Adjust quantity - only show if foodData exists */}
        {foodData && (
          <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5 space-y-3">
            {!id && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-emerald-900">
                    Adjust quantity
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Set the amount you actually ate. Nutritional values will be
                    calculated based on this quantity.
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 space-y-1.5">
                    <label
                      htmlFor="quantity"
                      className="text-xs font-medium text-slate-700"
                    >
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="e.g. 50"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    />
                  </div>
                  <div className="w-28 space-y-1.5">
                    <label
                      htmlFor="unit"
                      className="text-xs font-medium text-slate-700"
                    >
                      Unit
                    </label>
                    <select
                      id="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    >
                      <option value="gram">gram</option>
                      <option value="oz">oz</option>
                      <option value="lbs">lbs</option>
                      <option value="amount">quantity</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {saving ? "Saving..." : id ? "Update meal" : "Add to diary"}
            </button>
          </section>
        )}
      </main>

      <NavBar />
    </div>
  );
};

export default EditMeal;
