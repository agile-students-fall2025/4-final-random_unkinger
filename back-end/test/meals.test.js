const request = require("supertest");
const { expect } = require("chai");
const app = require("../server");

describe("Manual Meals API", () => {
  it("GET /api/meals returns seed meal list", async () => {
    const res = await request(app).get("/api/meals");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("meals");
    expect(res.body.meals).to.be.an("array");
    expect(res.body.meals[0]).to.have.property("name");
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
    const res = await request(app).post("/api/meals").send(payload);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("meal");
    expect(res.body.meal.name).to.equal(payload.name);
    expect(res.body.meal.calories).to.equal(payload.calories);
  });

  it("POST /api/meals rejects negative macros", async () => {
    const res = await request(app)
      .post("/api/meals")
      .send({ name: "Bad Meal", calories: -10 });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.match(/calories/i);
  });

  it("PUT /api/meals/:id updates an existing meal", async () => {
    const createRes = await request(app).post("/api/meals").send({
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
    const res = await request(app).put("/api/meals/999999").send({
      name: "Does not exist",
    });

    expect(res.status).to.equal(404);
    expect(res.body.error).to.match(/not found/i);
  });

  it("DELETE /api/meals/:id removes a meal", async () => {
    const createRes = await request(app).post("/api/meals").send({
      name: "Delete Me",
      calories: 250,
    });

    expect(createRes.status).to.equal(201);
    const mealId = createRes.body.meal.id;

    const deleteRes = await request(app).delete(`/api/meals/${mealId}`);
    expect(deleteRes.status).to.equal(200);
    expect(deleteRes.body.meal.id).to.equal(mealId);

    const listRes = await request(app).get("/api/meals");
    expect(listRes.status).to.equal(200);
    const ids = listRes.body.meals.map((meal) => meal.id);
    expect(ids).to.not.include(mealId);
  });

  it("DELETE /api/meals/:id returns 404 for missing meal", async () => {
    const res = await request(app).delete("/api/meals/123456789");
    expect(res.status).to.equal(404);
    expect(res.body.error).to.match(/not found/i);
  });
});


