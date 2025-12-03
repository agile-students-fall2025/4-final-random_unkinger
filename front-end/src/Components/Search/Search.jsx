import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const inputRef = useRef(null);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 200);
    return () => clearTimeout(t);
  }, [q]);

  // load recent searches
  useEffect(() => {
    let ignore = false;
    async function loadRecents() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/recents/searches");
        if (!res.ok) throw new Error(`Failed to load recents (${res.status})`);
        const data = await res.json();
        if (!ignore) {
          setRecent(
            Array.isArray(data.items) ? data.items.map((i) => i.query ?? i) : []
          );
        }
      } catch (e) {
        if (!ignore) setError("Couldn’t load recent searches.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadRecents();
    return () => {
      ignore = true;
    };
  }, []);

  const onKeyDown = async (e) => {
    if (e.key !== "Enter") return;
    const term = q.trim();
    if (!term) return;

    try {
      const res = await fetch("/api/recents/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: term }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to save search (${res.status})`);
      }
      const data = await res.json();
      setRecent((data.items || []).map((i) => i.query ?? i));
      setError("");
    } catch (err) {
      // local fallback if API fails
      setRecent((r) => {
        const next = [
          term,
          ...r.filter((x) => x.toLowerCase() !== term.toLowerCase()),
        ];
        return next.slice(0, 8);
      });
      setError("Saved locally (offline).");
    }
  };

  const data = tab === "products" ? PRODUCTS : tab === "food" ? FOODS : recent;

  const results = useMemo(() => {
    if (!debouncedQ) return [];
    const lower = debouncedQ.toLowerCase();
    return data.filter((item) => item.toLowerCase().includes(lower));
  }, [data, debouncedQ]);

  const headerLabel =
    tab === "recent" ? "Your recent searches" : "Search results";

  return (
    <div className=" min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-50 via-white to-lime-50 dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">

      <main className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 pt-4 pb-10">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => nav(-1)}
            className="inline-flex items-center justify-center rounded-full border border-emerald-100 bg-white/90 px-2.5 py-1.5 shadow-sm hover:bg-emerald-50 text-emerald-700 transition"
          >
            <i className="ri-arrow-left-line text-lg" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              NutriLens
            </span>
            <h1 className="text-sm font-semibold text-emerald-900">
              Search Foods & Products
            </h1>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5 space-y-4">
          {/* Search bar */}
          <div className="space-y-2">
            <label
              htmlFor="nutrilens-search"
              className="text-xs font-medium text-slate-600"
            >
              Search
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-200 transition">
              <i className="ri-search-line text-slate-400 text-lg" />
              <input
                id="nutrilens-search"
                ref={inputRef}
                type="text"
                placeholder="Search products or meals"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Search"
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
            </div>
            {error && tab === "recent" && (
              <p className="text-[11px] text-amber-700 bg-amber-50/80 border border-amber-100 rounded-xl px-3 py-1 mt-1">
                {error}
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-1 gap-1">
            {[
              { id: "products", label: "Products" },
              { id: "food", label: "Food" },
              { id: "recent", label: "Recent" },
            ].map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex-1 text-xs font-medium rounded-xl px-2 py-1.5 transition ${
                    active
                      ? "bg-white shadow-sm text-emerald-700"
                      : "text-slate-500 hover:text-emerald-700 hover:bg-white/60"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Results header */}
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs font-medium text-slate-600">
              {headerLabel}
            </p>
            {tab === "recent" && loading && (
              <span className="text-[11px] text-slate-400">Loading…</span>
            )}
          </div>

          {/* Results body */}
          <div className="mt-1 max-h-80 overflow-y-auto">
            {!q.trim() ? (
              <div className="text-xs text-slate-400 text-center py-4">
                Start typing to search for foods or products you use often.
              </div>
            ) : results.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">
                No results for{" "}
                <span className="font-semibold text-emerald-700">
                  “{debouncedQ}”
                </span>
                .
              </div>
            ) : (
              <ul className="space-y-2">
                {results.map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-50 bg-emerald-50/60 px-3 py-2"
                  >
                    <span className="text-sm text-emerald-900 truncate">
                      {item}
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 transition"
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
      </main>
    </div>
  );
}