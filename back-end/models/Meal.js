const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    carbs: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    protein: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    fat: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    source: {
      type: String,
      enum: ["manual", "scanned"],
      default: "manual",
      index: true,
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    loggedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries by user and date
mealSchema.index({ userId: 1, loggedAt: -1 });

// Index for efficient date range queries
mealSchema.index({ userId: 1, source: 1, loggedAt: -1 });

module.exports = mongoose.model("Meal", mealSchema);

