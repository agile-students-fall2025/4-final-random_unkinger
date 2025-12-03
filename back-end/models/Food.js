const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {},
  { collection: "foodlist", strict: false }
);

module.exports = mongoose.model("Food", foodSchema);
