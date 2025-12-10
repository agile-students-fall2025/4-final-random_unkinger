require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const axios = require("axios");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { body, param, validationResult } = require("express-validator");
const Profile = require("./models/Profile");
const Activity = require("./models/Activity");
const Meal = require("./models/Meal");
const Food = require("./models/Food");
const authRoutes = require("./routes/auth");
const jwtStrategy = require("./config/jwt-config");
const app = express();
// 10 mb limit for images increase if you are rich i am poor rn
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());
passport.use(jwtStrategy);
app.use(passport.initialize());
app.get("/", (req, res) => {
  res.send("NutriLens API is running");
});
app.use("/api/auth", authRoutes);
app.get(
  "/api/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ message: "You accessed a protected route!", user: req.user });
  }
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

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
  body("name")
    .optional({ checkFalsy: false })
    .isString()
    .trim()
    .isLength({ max: 100 }),

  body("age").optional({ checkFalsy: true }).isInt({ min: 0, max: 200 }),
  body("heightCm").optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body("weightKg").optional({ checkFalsy: true }).isFloat({ min: 0 }),

  body("activity")
    .optional({ checkFalsy: true })
    .isIn(["sedentary", "light", "moderate", "active", "very_active"]),

  body("calorieGoal").optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body("proteinGoal").optional({ checkFalsy: true }).isFloat({ min: 0 }),

  body("avatarUrl")
    .optional({ checkFalsy: true })
    .isString(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateMeal = [
  body("name")
    .exists()
    .withMessage("Meal name is required")
    .isString()
    .withMessage("Meal name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Meal name cannot be empty"),

  body("calories")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Calories must be a non-negative integer"),

  body("protein")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Protein must be a non-negative number"),

  body("carbs")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Carbs must be a non-negative number"),

  body("fat")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Fat must be a non-negative number"),

  body("loggedAt")
    .optional()
    .isISO8601()
    .withMessage("loggedAt must be a valid ISO date"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }
    next();
  },
];

const validateMealId = [
  param("id")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid meal ID."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors.array() });
    }
    next();
  },
];

const validateActivity = [
  body("name")
    .notEmpty()
    .withMessage("Activity name is required")
    .isString()
    .trim()
    .isLength({ max: 200 }),

  body("time")
    .notEmpty()
    .withMessage("Duration is required")
    .isInt({ min: 1, max: 24 * 60 })
    .withMessage("Duration must be a positive number of minutes"),

  body("notes")
    .optional({ checkFalsy: true })
    .isString()
    .isLength({ max: 1000 })
    .withMessage("Notes must be at most 1000 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateActivityId = [
  param("id")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid activity ID."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors.array() });
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

app.get("/api/activities", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = await Activity.find({ userId }).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(activities);
  } catch (err) {
    console.error("Error loading activities:", err);
    res.status(500).json({ error: "Failed to load activities" });
  }
});

app.post("/api/activities", auth, validateActivity, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, time, notes } = req.body;

    const activity = new Activity({
      userId,
      name: name.trim(),
      timeMinutes: Number(time),
      notes: notes || "",
    });

    const saved = await activity.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving activity:", err);
    res.status(500).json({ error: "Failed to save activity" });
  }
});

app.put(
  "/api/activities/:id",
  auth,
  validateActivityId,
  validateActivity,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { name, time, notes } = req.body || {};

      const current = await Activity.findOne({ _id: id, userId });
      if (!current) {
        return res.status(404).json({ error: "Activity not found" });
      }

      current.name = name.trim();
      current.timeMinutes = Number(time);
      current.notes = notes || "";

      const saved = await current.save();
      res.json(saved);
    } catch (err) {
      console.error("Error updating activity:", err);
      res.status(500).json({ error: "Failed to update activity" });
    }
  }
);

app.delete("/api/activities/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await Activity.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting activity:", err);
    res.status(500).json({ error: "Failed to delete activity" });
  }
});

app.get("/api/meals", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    console.log(
      `📖 [MongoDB] Loading meals for: ${userId}${
        date ? ` (date: ${date})` : ""
      }`
    );

    let query = { userId };

    if (date) {
      const targetDate = new Date(date + "T00:00:00");
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.loggedAt = {
        $gte: targetDate,
        $lt: nextDay,
      };
    }

    const meals = await Meal.find(query).sort({ loggedAt: -1 }).lean();

    const formattedMeals = meals.map((meal) => ({
      id: meal._id.toString(),
      name: meal.name,
      calories: meal.calories,
      carbs: meal.carbs,
      protein: meal.protein,
      fat: meal.fat,
      notes: meal.notes || "",
      source: meal.source || "manual",
      image: meal.image || "",
      loggedAt: meal.loggedAt.toISOString(),
    }));

    console.log(`   Found ${formattedMeals.length} meals`);
    res.json({ meals: formattedMeals });
  } catch (err) {
    console.error("Error loading meals:", err);
    res.status(500).json({ error: "Failed to load meals" });
  }
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
        imageUrl:
          product.image_front_url ||
          product.image_url ||
          product.image_front_small_url ||
          product.image_front_thumb_url ||
          null,
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

app.post("/api/meals", auth, validateMeal, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`📥 [MongoDB] Creating meal for user: ${userId}`);
    console.log(`   → Request body:`, req.body);

    const { name, calories, carbs, protein, fat, notes, source, image } =
      req.body || {};

    const mealSource = source === "scanned" ? "scanned" : "manual";

    const newMeal = new Meal({
      userId,
      name: name.trim(),
      calories: Number(calories) || 0,
      carbs: Number(carbs) || 0,
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
      notes: typeof notes === "string" ? notes.trim() : "",
      source: mealSource,
      image: image || "",
      loggedAt: new Date(),
    });

    const saved = await newMeal.save();

    console.log(`💾 [MongoDB] Meal saved for: ${userId}`);
    console.log(
      `   → Meal: ${saved.name} (${saved.calories} cal, ${saved.protein}g protein, source: ${saved.source})`
    );

    res.status(201).json({
      meal: {
        id: saved._id.toString(),
        name: saved.name,
        calories: saved.calories,
        carbs: saved.carbs,
        protein: saved.protein,
        fat: saved.fat,
        notes: saved.notes,
        source: saved.source,
        image: saved.image,
        loggedAt: saved.loggedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Error saving meal:", err);
    console.error("   → Error details:", err.message);
    console.error("   → Stack:", err.stack);
    res
      .status(500)
      .json({ error: "Failed to save meal", details: err.message });
  }
});

app.put("/api/meals/:id", auth, validateMealId, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const current = await Meal.findOne({ _id: id, userId });

    if (!current) {
      return res.status(404).json({ error: "Meal not found." });
    }

    const {
      name = current.name,
      calories = current.calories,
      carbs = current.carbs,
      protein = current.protein,
      fat = current.fat,
      notes = current.notes,
      image = current.image,
    } = req.body || {};

    const updatedMeal = await Meal.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        calories: Number(calories) || 0,
        carbs: Number(carbs) || 0,
        protein: Number(protein) || 0,
        fat: Number(fat) || 0,
        notes: typeof notes === "string" ? notes.trim() : current.notes,
        image: image || current.image,
      },
      { new: true }
    );

    console.log(`💾 [MongoDB] Meal updated for: ${userId}`);
    console.log(`   → Meal: ${updatedMeal.name} (ID: ${id})`);

    res.json({
      meal: {
        id: updatedMeal._id.toString(),
        name: updatedMeal.name,
        calories: updatedMeal.calories,
        carbs: updatedMeal.carbs,
        protein: updatedMeal.protein,
        fat: updatedMeal.fat,
        notes: updatedMeal.notes,
        source: updatedMeal.source,
        image: updatedMeal.image,
        loggedAt: updatedMeal.loggedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Error updating meal:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid meal ID." });
    }
    res.status(500).json({ error: "Failed to update meal" });
  }
});

app.delete("/api/meals/:id", auth, validateMealId, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await Meal.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return res.status(404).json({ error: "Meal not found." });
    }

    console.log(`🗑️  [MongoDB] Meal deleted for: ${userId}`);
    console.log(`   → Deleted meal: ${deleted.name} (ID: ${id})`);

    res.json({
      meal: {
        id: deleted._id.toString(),
        name: deleted.name,
        calories: deleted.calories,
        carbs: deleted.carbs,
        protein: deleted.protein,
        fat: deleted.fat,
        notes: deleted.notes,
        source: deleted.source,
        image: deleted.image,
        loggedAt: deleted.loggedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Error deleting meal:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid meal ID." });
    }
    res.status(500).json({ error: "Failed to delete meal" });
  }
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

app.get("/api/foods/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ foods: [] });

    const foods = await Food.aggregate([
      { $unwind: "$FoundationFoods" },
      {
        $match: {
          "FoundationFoods.description": { $regex: q, $options: "i" },
        },
      },
      { $limit: 20 },
      {
        $project: {
          description: "$FoundationFoods.description",
          foodNutrients: "$FoundationFoods.foodNutrients",
        },
      },
    ]);

    const results = foods.map((f) => {
      const getNutrient = (namePart) => {
        if (!f.foodNutrients) return 0;
        const n = f.foodNutrients.find(
          (fn) =>
            fn.nutrient &&
            fn.nutrient.name &&
            fn.nutrient.name.toLowerCase().includes(namePart.toLowerCase())
        );
        return n ? n.amount : 0;
      };

      return {
        id: f._id,
        description: f.description,
        calories: getNutrient("Energy"),
        protein: getNutrient("Protein"),
        carbs: getNutrient("Carbohydrate, by difference"),
        fat: getNutrient("Total lipid (fat)"),
      };
    });

    res.json({ foods: results });
  } catch (err) {
    console.error("Error searching foods:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

const PORT = process.env.PORT || 5050;

if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`API listening on http://localhost:${PORT}`)
  );
}

module.exports = app;
