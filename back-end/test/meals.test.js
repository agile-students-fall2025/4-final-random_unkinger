const request = require("supertest");
const { expect } = require("chai");
const app = require("../server");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function getTestToken() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "testpassword123";

  const passwordHash = await bcrypt.hash(testPassword, 10);
  const user = new User({
    username: "testuser",
    email: testEmail,
    passwordHash,
  });
  await user.save();

  const loginRes = await request(app).post("/api/auth/login").send({
    email: testEmail,
    password: testPassword,
  });

  return loginRes.body.token;
}

describe("Manual Meals API", () => {
  let authToken;

  before(async () => {
    authToken = await getTestToken();
  });

  it("GET /api/meals returns seed meal list", async () => {
    const res = await request(app)
      .get("/api/meals")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("meals");
    expect(res.body.meals).to.be.an("array");
  });

  it("GET /api/meals?date filters meals by date", async () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const createRes = await request(app)
      .post("/api/meals")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Today's Meal",
        calories: 400,
      });
    expect(createRes.status).to.equal(201);

    const filteredRes = await request(app)
      .get(`/api/meals?date=${todayStr}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(filteredRes.status).to.equal(200);
    expect(filteredRes.body.meals).to.be.an("array");
    const hasTodaysMeal = filteredRes.body.meals.some(
      (meal) => meal.name === "Today's Meal"
    );
    expect(hasTodaysMeal).to.be.true;
  });

  it("POST /api/meals creates a new meal entry", async () => {
    const payload = {
      name: "Homemade Stir Fry",
      calories: 520,
      carbs: 55,
      protein: 32,
      fat: 18,
      notes: "Brown rice, chicken, broccoli",
    };
    const res = await request(app)
      .post("/api/meals")
      .set("Authorization", `Bearer ${authToken}`)
      .send(payload);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("meal");
    expect(res.body.meal.name).to.equal(payload.name);
    expect(res.body.meal.calories).to.equal(payload.calories);
  });

  it("POST /api/meals rejects negative macros", async () => {
    const res = await request(app)
      .post("/api/meals")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Bad Meal", calories: -10 });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal("Validation failed");
    expect(res.body.details).to.be.an("array");
    const caloriesError = res.body.details.find(
      (d) => d.msg && d.msg.toLowerCase().includes("calories")
    );
    expect(caloriesError).to.exist;
  });

  it("PUT /api/meals/:id updates an existing meal", async () => {
    const createRes = await request(app)
      .post("/api/meals")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Edit Me",
        calories: 300,
        carbs: 40,
        protein: 20,
        fat: 10,
      });

    expect(createRes.status).to.equal(201);
    const mealId = createRes.body.meal.id;

    const updateRes = await request(app)
      .put(`/api/meals/${mealId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Updated Meal",
        calories: 450,
        protein: 35,
      });

    expect(updateRes.status).to.equal(200);
    expect(updateRes.body).to.have.property("meal");
    expect(updateRes.body.meal.name).to.equal("Updated Meal");
    expect(updateRes.body.meal.calories).to.equal(450);
    expect(updateRes.body.meal.protein).to.equal(35);
  });

  it("PUT /api/meals/:id returns 404 for missing meal", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .put(`/api/meals/${fakeId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Does not exist",
      });

    expect(res.status).to.equal(404);
    expect(res.body.error).to.match(/not found/i);
  });

  it("DELETE /api/meals/:id removes a meal", async () => {
    const createRes = await request(app)
      .post("/api/meals")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Delete Me",
        calories: 250,
      });

    expect(createRes.status).to.equal(201);
    const mealId = createRes.body.meal.id;

    const deleteRes = await request(app)
      .delete(`/api/meals/${mealId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(deleteRes.status).to.equal(200);
    expect(deleteRes.body.meal.id).to.equal(mealId);

    const listRes = await request(app)
      .get("/api/meals")
      .set("Authorization", `Bearer ${authToken}`);
    expect(listRes.status).to.equal(200);
    const ids = listRes.body.meals.map((meal) => meal.id);
    expect(ids).to.not.include(mealId);
  });

  it("DELETE /api/meals/:id returns 404 for missing meal", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .delete(`/api/meals/${fakeId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).to.equal(404);
    expect(res.body.error).to.match(/not found/i);
  });
});
