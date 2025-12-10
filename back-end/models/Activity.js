const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
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
    timeMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
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

activitySchema.index({ userId: 1, loggedAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
