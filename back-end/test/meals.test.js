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
});


