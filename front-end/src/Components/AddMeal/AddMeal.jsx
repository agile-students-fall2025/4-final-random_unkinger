import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../NavBar/NavBar";

const AddMeal = () => {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex flex-col dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="px-4 sm:px-6 pt-4 pb-3 border-b border-emerald-100/70 bg-white/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-full border border-emerald-100 bg-white/90 px-2.5 py-1.5 shadow-sm hover:bg-emerald-50 text-emerald-700 transition"
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
              Quick add meal
            </h1>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-4">
        <section className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-sm p-4 sm:p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-emerald-900">
              How would you like to log this meal?
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Choose the option that matches what you’re eating right now.
            </p>
          </div>

          <div className="space-y-3">
            {/* Search product */}
            <button
              type="button"
              onClick={handleSearchClick}
              className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-left shadow-sm hover:bg-slate-100/80 transition"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <i className="ri-search-line text-lg" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  Search product
                </p>
                <p className="text-[11px] text-slate-500">
                  Look up packaged foods or common items by name.
                </p>
              </div>
              <i className="ri-arrow-right-s-line text-slate-400 text-lg" />
            </button>

            {/* Scan product */}
            <button
              type="button"
              onClick={handleScanClick}
              className="w-full flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-3.5 py-3 text-left shadow-sm hover:bg-emerald-100/80 transition"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <i className="ri-qr-scan-line text-lg" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-900">
                  Scan barcode
                </p>
                <p className="text-[11px] text-emerald-800/80">
                  Use your camera to scan the barcode on a package.
                </p>
              </div>
              <i className="ri-arrow-right-s-line text-emerald-500 text-lg" />
            </button>

            {/* Manual entry */}
            <button
              type="button"
              onClick={handleManualClick}
              className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3 text-left shadow-sm hover:bg-slate-100/80 transition"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <i className="ri-edit-box-line text-lg" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  Enter manually
                </p>
                <p className="text-[11px] text-slate-500">
                  Perfect for homemade meals or custom recipes.
                </p>
              </div>
              <i className="ri-arrow-right-s-line text-slate-400 text-lg" />
            </button>
          </div>
        </section>
      </main>

      <NavBar />
    </div>
  );
};

export default AddMeal;