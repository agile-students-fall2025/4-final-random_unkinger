require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Profile = require("./models/Profile");

const app = express();
app.use(express.json());
app.use(cors());


mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });



function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Missing Authorization token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}



const validateProfile = [
  body("name").optional().isString().trim().isLength({ max: 100 }),
  body("age").optional().isInt({ min: 0, max: 200 }),
  body("heightCm").optional().isFloat({ min: 0 }),
  body("weightKg").optional().isFloat({ min: 0 }),
  body("activity")
    .optional()
    .isIn(["sedentary", "light", "moderate", "active", "very_active"]),
  body("calorieGoal").optional().isFloat({ min: 0 }),
  body("proteinGoal").optional().isFloat({ min: 0 }),
  body("avatarUrl").optional().isString().isLength({ max: 500 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];


const MAX_RECENTS = 10;
let recentSearches = [];
let recentMeals = [];

app.__resetRecents = () => {
  recentSearches = [];
  recentMeals = [];
};

function addRecentSearch(queryRaw) {
  const query = String(queryRaw || "").trim();
  if (!query) {
    const err = new Error("Missing or invalid query");
    err.status = 400;
    throw err;
  }
  const normalized = query.toLowerCase();
  recentSearches = [
    { query, normalized, savedAt: new Date().toISOString() },
    ...recentSearches.filter((s) => s.normalized !== normalized),
  ];
  recentSearches = recentSearches.slice(0, MAX_RECENTS);
  return recentSearches;
}


const manualMeals = [
  {
    id: 1,
    name: "Overnight Oats",
    calories: 350,
    carbs: 45,
    protein: 18,
    fat: 12,
    notes: "Made with almond milk, chia seeds, blueberries.",
    loggedAt: new Date().toISOString(),
    source: "manual", // "manual" or "scanned"
  },
];


app.get("/api/profile", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.json({
        userId,
        name: "",
        age: "",
        heightCm: "",
        weightKg: "",
        activity: "sedentary",
        calorieGoal: "",
        proteinGoal: "",
        avatarUrl: `https://picsum.photos/seed/profile-${userId}/120/120`,
      });
    }

    res.json(profile);
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

app.post("/api/profile", auth, validateProfile, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      age,
      heightCm,
      weightKg,
      activity,
      calorieGoal,
      proteinGoal,
      avatarUrl,
    } = req.body;

    const update = {
      ...(name !== undefined && { name: name.trim() }),
      ...(age !== undefined && { age: Number(age) }),
      ...(heightCm !== undefined && { heightCm: Number(heightCm) }),
      ...(weightKg !== undefined && { weightKg: Number(weightKg) }),
      ...(activity !== undefined && { activity }),
      ...(calorieGoal !== undefined && { calorieGoal: Number(calorieGoal) }),
      ...(proteinGoal !== undefined && { proteinGoal: Number(proteinGoal) }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    };

    const saved = await Profile.findOneAndUpdate(
      { userId },
      { userId, ...update },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({ ok: true, saved });
  } catch (err) {
    console.error("Error saving profile:", err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});


app.get("/api/meals", (req, res) => {
  const { date } = req.query;

  if (date) {
    const filteredMeals = manualMeals.filter((meal) => {
      if (!meal.loggedAt) return false;
      const mealDate = new Date(meal.loggedAt);
      const targetDate = new Date(date + "T00:00:00");

      return (
        mealDate.getFullYear() === targetDate.getFullYear() &&
        mealDate.getMonth() === targetDate.getMonth() &&
        mealDate.getDate() === targetDate.getDate()
      );
    });
    return res.json({ meals: filteredMeals });
  }

  res.json({ meals: manualMeals });
});

app.get("/api/barcode/:barcode", async (req, res) => {
  const { barcode } = req.params;

  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    if (response.data.status === 1) {
      const product = response.data.product;

      const nutri = product.nutriments || {};
      const nutriData = {
        barcode: barcode,
        name: product.product_name || "Unknown",
        brand: product.brands || "Unknown",
        imageUrl: product.image_url || null,
        calories: Math.round((nutri.energy_value || 0) / 4.184),
        protein: Math.round((nutri.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((nutri.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((nutri.fat_100g || 0) * 10) / 10,
        fiber: Math.round((nutri.fiber_100g || 0) * 10) / 10,
        sugar: Math.round((nutri.sugars_100g || 0) * 10) / 10,
      };

      return res.json(nutriData);
    }
    res.status(404).json({
      error: "product not found",
      barcode,
    });
  } catch (e) {
    res.status(505).json({
      error: "failed to fetch product data",
      details: e.message,
    });
  }
});

app.post("/api/meals", (req, res) => {
  const { name, calories, carbs, protein, fat, notes, source } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Meal name is required." });
  }

  const numericFields = { calories, carbs, protein, fat };
  for (const [field, value] of Object.entries(numericFields)) {
    if (value !== undefined) {
      const numberValue = Number(value);
      if (Number.isNaN(numberValue) || numberValue < 0) {
        return res
          .status(400)
          .json({ error: `${field} must be a non-negative number.` });
      }
    }
  }

  const mealSource = source === "scanned" ? "scanned" : "manual";

  const newMeal = {
    id: Date.now(),
    name: name.trim(),
    calories: Number(calories) || 0,
    carbs: Number(carbs) || 0,
    protein: Number(protein) || 0,
    fat: Number(fat) || 0,
    notes: typeof notes === "string" ? notes.trim() : "",
    loggedAt: new Date().toISOString(),
    source: mealSource,
  };

  manualMeals.unshift(newMeal);
  res.status(201).json({ meal: newMeal });
});

app.put("/api/meals/:id", (req, res) => {
  const mealId = Number(req.params.id);

  if (!Number.isInteger(mealId)) {
    return res.status(400).json({ error: "Meal id must be a valid integer." });
  }

  const index = manualMeals.findIndex((meal) => meal.id === mealId);

  if (index === -1) {
    return res.status(404).json({ error: "Meal not found." });
  }

  const current = manualMeals[index];
  const {
    name = current.name,
    calories = current.calories,
    carbs = current.carbs,
    protein = current.protein,
    fat = current.fat,
    notes = current.notes,
  } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Meal name is required." });
  }

  const numericFields = { calories, carbs, protein, fat };
  for (const [field, value] of Object.entries(numericFields)) {
    if (value !== undefined) {
      const numberValue = Number(value);
      if (Number.isNaN(numberValue) || numberValue < 0) {
        return res
          .status(400)
          .json({ error: `${field} must be a non-negative number.` });
      }
    }
  }
  const updatedMeal = {
    ...current,
    name: name.trim(),
    calories: Number(calories) || 0,
    carbs: Number(carbs) || 0,
    protein: Number(protein) || 0,
    fat: Number(fat) || 0,
    notes: typeof notes === "string" ? notes.trim() : current.notes,
    updatedAt: new Date().toISOString(),
  };

  manualMeals[index] = updatedMeal;
  res.json({ meal: updatedMeal });
});

app.delete("/api/meals/:id", (req, res) => {
  const mealId = Number(req.params.id);

  if (!Number.isInteger(mealId)) {
    return res.status(400).json({ error: "Meal id must be a valid integer." });
  }

  const index = manualMeals.findIndex((meal) => meal.id === mealId);

  if (index === -1) {
    return res.status(404).json({ error: "Meal not found." });
  }

  const [deletedMeal] = manualMeals.splice(index, 1);
  res.json({ meal: deletedMeal });
});

app.get("/api/recents/searches", (_req, res) => {
  res.json({ items: recentSearches });
});

app.post("/api/recents/searches", (req, res) => {
  try {
    const items = addRecentSearch(req.body?.query);
    res.status(201).json({ items });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Server error" });
  }
});

app.get("/api/recents/meals", (_req, res) => {
  res.json({ items: recentMeals });
});

const PORT = process.env.PORT || 5050;

if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`API listening on http://localhost:${PORT}`)
  );
}

module.exports = app;