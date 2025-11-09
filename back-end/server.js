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

app.get("/api/profile", (req, res) => {
  res.json(MOCK_PROFILE);
});

app.post("/api/profile", (req, res) => {
  res.status(200).json({ ok: true, saved: req.body });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () =>
  console.log(`API listening on http://localhost:${PORT}`)
);
