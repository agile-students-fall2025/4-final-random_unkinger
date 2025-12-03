import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5050";

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
      setError("No barcode provided.");
    }
  }, [barcode]);

  const fetchFoodData = async (code) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API}/api/barcode/${code}`);

      if (res.ok) {
        const data = await res.json();
        setFoodData(data);
      } else {
        const errorBody = await res.json().catch(() => ({}));
        setError(errorBody.error || "Product not found.");
      }
    } catch (e) {
      console.error("Barcode fetch error:", e);
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    // later you might POST this as a scanned meal before navigating
    navigate("/home");
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
  const imageUrl =
    foodData?.imageUrl || "https://picsum.dev/image/1277/view";

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
              Edit scanned meal
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
            <div className="aspect-[4/3] w-full">
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
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
              <p className="text-[11px] text-slate-500">per 100 g</p>
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
            <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              {error}
            </div>
          )}
        </section>

        {/* Adjust quantity */}
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-emerald-900">
              Adjust quantity
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Set the amount you actually ate. (For now, this is for your own
              reference — we’ll still add one serving.)
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

          <button
            type="button"
            onClick={handleAdd}
            className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition"
          >
            Add to diary
          </button>
        </section>
      </main>
    </div>
  );
};

export default EditMeal;