const request = require("supertest");
const { expect } = require("chai");
const app = require("../server");

describe("Profile API", () => {
  it("GET /api/profile returns mock profile", async () => {
    const res = await request(app).get("/api/profile");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("calorieGoal");
    expect(res.body).to.have.property("proteinGoal");
  });

  it("POST /api/profile accepts valid body", async () => {
    const res = await request(app)
      .post("/api/profile")
      .send({ calorieGoal: 1800, proteinGoal: 100 });
    expect(res.status).to.equal(200);
    expect(res.body.ok).to.equal(true);
    expect(res.body.saved.calorieGoal).to.equal(1800);
  });

  it("POST /api/profile rejects negative goals", async () => {
    const res = await request(app)
      .post("/api/profile")
      .send({ calorieGoal: -1 });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.match(/calorieGoal/i);
  });
});
