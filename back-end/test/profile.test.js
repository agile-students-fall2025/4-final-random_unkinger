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

describe("Profile API", () => {
  let authToken;

  before(async () => {
    authToken = await getTestToken();
  });

  it("GET /api/profile returns mock profile", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("calorieGoal");
    expect(res.body).to.have.property("proteinGoal");
  });

  it("POST /api/profile accepts valid body", async () => {
    const res = await request(app)
      .post("/api/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ calorieGoal: 1800, proteinGoal: 100 });
    expect(res.status).to.equal(200);
    expect(res.body.ok).to.equal(true);
    expect(res.body.saved.calorieGoal).to.equal(1800);
  });

  it("POST /api/profile rejects negative goals", async () => {
    const res = await request(app)
      .post("/api/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ calorieGoal: -1 });
    expect(res.status).to.equal(400);
    if (res.body.details) {
      const calorieError = res.body.details.find(
        (d) => d.msg && d.msg.toLowerCase().includes("calorie")
      );
      expect(calorieError).to.exist;
    } else if (res.body.errors) {
      const calorieError = res.body.errors.find(
        (e) =>
          (e.msg && e.msg.toLowerCase().includes("calorie")) ||
          (e.param && e.param.toLowerCase().includes("calorie")) ||
          (e.path && e.path.toLowerCase().includes("calorie"))
      );
      expect(calorieError).to.exist;
    } else {
      expect(res.body.error).to.match(/calorieGoal/i);
    }
  });
});
