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
    protein: 18,
    carbs: 45,
    fat: 12,
    calories: 350,
    loggedAt: "2025-11-10T21:29:00",
    image: "https://picsum.photos/id/1060/400/300",
  },
  {
    id: 2,
    name: "Chicken Salad",
    protein: 32,
    carbs: 10,
    fat: 15,
    calories: 360,
    loggedAt: "2025-11-10T13:45:00",
    image: "https://picsum.photos/id/292/400/300",
  },
  {
    id: 3,
    name: "Pasta Primavera",
    protein: 15,
    carbs: 70,
    fat: 9,
    calories: 450,
    loggedAt: "2025-11-10T18:00:00",
    image: "https://picsum.photos/id/1080/400/300",
  },
  {
    id: 4,
    name: "Avocado Toast",
    protein: 10,
    carbs: 30,
    fat: 20,
    calories: 280,
    loggedAt: "2025-11-10T09:00:00",
    image: "https://picsum.photos/id/1052/400/300",
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
  const { date } = req.query;
  let filtered = manualMeals;

  if (date) {
    const start = new Date(date + "T00:00:00");
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filtered = manualMeals.filter((m) => {
      const logged = new Date(m.loggedAt);
      return logged >= start && logged < end;
    });
  }

  res.json({ meals: filtered });
});



app.get("/api/macros/summary", (req, res) => {
    const { date } = req.query; 
    let filteredMeals = manualMeals;

    if (date) {
        const start = new Date(date + "T00:00:00");
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        filteredMeals = manualMeals.filter((m) => {
            const logged = new Date(m.loggedAt);
            return logged >= start && logged < end;
        });
    }

    if (filteredMeals.length === 0) {

        return res.status(200).json({ 
            mostProtein: { name: "", value: 0 },
            mostCarbs: { name: "", value: 0 },
            mostFat: { name: "", value: 0 },
            message: "No meals available for this date." 
        });
    }


    const mostProtein = filteredMeals.reduce((a, b) => 
        a.protein > b.protein ? a : b
    );
    const mostCarbs = filteredMeals.reduce((a, b) => 
        a.carbs > b.carbs ? a : b
    );
    const mostFat = filteredMeals.reduce((a, b) => 
        a.fat > b.fat ? a : b
    );

    res.json({
        mostProtein: { name: mostProtein.name, value: mostProtein.protein },
        mostCarbs: { name: mostCarbs.name, value: mostCarbs.carbs },
        mostFat: { name: mostFat.name, value: mostFat.fat },
    });
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
