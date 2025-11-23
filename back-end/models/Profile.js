const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, trim: true },
    age: { type: Number, min: 0, max: 120 },
    heightCm: { type: Number, min: 0 },
    weightKg: { type: Number, min: 0 },
    activity: {
      type: String,
      enum: [
        "sedentary",
        "light",
        "moderate",
        "active",
        "very_active",
      ],
      default: "sedentary",
    },
    calorieGoal: { type: Number, min: 0 },
    proteinGoal: { type: Number, min: 0 },
    avatarUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
