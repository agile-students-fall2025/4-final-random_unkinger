const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const MOCK_PROFILE = {
  name: "John",
  age: 21,
  heightCm: 165,
  weightKg: 60,
  activity: "moderate",
  calorieGoal: 2000,
  proteinGoal: 120,
  avatarUrl: "https://picsum.photos/seed/mock/120/120",
};

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
  },
];

app.get("/api/profile", (req, res) => {
  res.json(MOCK_PROFILE);
});

app.post("/api/profile", (req, res) => {
  const { calorieGoal, proteinGoal } = req.body;

  if (
    (typeof calorieGoal === "number" && calorieGoal < 0) ||
    (typeof proteinGoal === "number" && proteinGoal < 0)
  ) {
    return res.status(400).json({
      error: "calorieGoal and proteinGoal must be positive numbers.",
    });
  }

  res.status(200).json({ ok: true, saved: req.body });
});

app.get("/api/meals", (req, res) => {
  res.json({ meals: manualMeals });
});

app.post("/api/meals", (req, res) => {
  const { name, calories, carbs, protein, fat, notes } = req.body || {};

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

  const newMeal = {
    id: Date.now(),
    name: name.trim(),
    calories: Number(calories) || 0,
    carbs: Number(carbs) || 0,
    protein: Number(protein) || 0,
    fat: Number(fat) || 0,
    notes: typeof notes === "string" ? notes.trim() : "",
    loggedAt: new Date().toISOString(),
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

const PORT = process.env.PORT || 5050;

if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`API listening on http://localhost:${PORT}`)
  );
}

module.exports = app;
