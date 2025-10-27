import React, { useEffect, useMemo, useRef, useState } from "react";
import "../LoginSignup/LoginSignup.css";
import "./Search.css";
import { useNavigate } from "react-router-dom";

const PRODUCTS = [
  "Protein Powder",
  "Greek Yogurt",
  "Almond Butter",
  "Oats",
  "Chicken Breast",
  "Brown Rice",
  "Olive Oil",
  "Egg Whites",
  "Cottage Cheese",
  "Spinach",
  "Bananas",
  "Blueberries",
];

const FOODS = [
  "Caesar Salad",
  "Grilled Salmon",
  "Veggie Omelette",
  "Turkey Sandwich",
  "Chicken Burrito Bowl",
  "Avocado Toast",
  "Quinoa Bowl",
  "Pasta Primavera",
  "Beef Stir Fry",
];

export default function Search() {
  const nav = useNavigate();
  const [tab, setTab] = useState("products");
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState([]);
  const [debouncedQ, setDebouncedQ] = useState(q);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 200);
    return () => clearTimeout(t);
  }, [q]);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      const term = q.trim();
      if (!term) return;
      setRecent((r) => {
        const next = [term, ...r.filter((x) => x !== term)];
        return next.slice(0, 8);
      });
    }
  };

  const data = tab === "products" ? PRODUCTS : tab === "food" ? FOODS : recent;
  const results = useMemo(() => {
    if (!debouncedQ) return [];
    const lower = debouncedQ.toLowerCase();
    return data.filter((item) => item.toLowerCase().includes(lower));
  }, [data, debouncedQ]);

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-topbar">
          <button
            className="back-btn"
            onClick={() => nav(-1)}
            aria-label="Go back"
          >
            ←
          </button>
          <div className="search-title"></div>
        </div>

        <div className="searchbar-wrap">
          <div className="searchbar">
            <span className="search-icon">🔎</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Search"
            />
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${tab === "products" ? "active" : ""}`}
            onClick={() => setTab("products")}
          >
            Products
          </button>
          <button
            className={`tab ${tab === "food" ? "active" : ""}`}
            onClick={() => setTab("food")}
          >
            Food
          </button>
          <button
            className={`tab ${tab === "recent" ? "active" : ""}`}
            onClick={() => setTab("recent")}
          >
            Recent
          </button>
        </div>

        <div className="results-header">Search results</div>

        <div className="results-body">
          {!q.trim() ? (
            <div className="hint"></div>
          ) : results.length === 0 ? (
            <div className="hint">No results for “{debouncedQ}”.</div>
          ) : (
            <ul className="results-list">
              {results.map((item) => (
                <li key={item} className="result-row">
                  <span>{item}</span>
                  <button
                    className="add-btn"
                    onClick={() => alert(`Added: ${item}`)}
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
