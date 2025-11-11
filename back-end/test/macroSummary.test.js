const request = require("supertest");
const { expect } = require("chai");
const app = require("../server"); 
describe("GET /api/macros/summary", () => {
  it("should return the most protein, carbs, and fat meals", async () => {
    const res = await request(app).get("/api/macros/summary");
    expect(res.status).to.equal(200);

    expect(res.body).to.have.property("mostProtein");
    expect(res.body).to.have.property("mostCarbs");
    expect(res.body).to.have.property("mostFat");

    expect(res.body.mostProtein).to.have.property("name");
    expect(res.body.mostProtein).to.have.property("value");
    expect(res.body.mostCarbs).to.have.property("name");
    expect(res.body.mostCarbs).to.have.property("value");
    expect(res.body.mostFat).to.have.property("name");
    expect(res.body.mostFat).to.have.property("value");
  });

  it("should return 'No meals available for this date.' if no meals match the date", async () => {
    const res = await request(app).get("/api/macros/summary?date=1900-01-01");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message");
    expect(res.body.message).to.match(/no meals/i);
    expect(res.body.mostProtein.value).to.equal(0);
  });

  it("should filter meals by date and still return summary data", async () => {
    const res = await request(app).get("/api/macros/summary?date=2025-11-04");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("mostProtein");
    expect(res.body.mostProtein).to.have.property("name");
  });
});
