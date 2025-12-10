const request = require("supertest");
const { expect } = require("chai");
const app = require("../server");

describe("Recent Searches API", () => {
  beforeEach(() => {
    if (app.__resetRecents) app.__resetRecents();
  });

  it("GET /api/recents/searches returns an array of recent searches", async () => {
    const res = await request(app).get("/api/recents/searches");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("items");
    expect(res.body.items).to.be.an("array");
  });
  it("POST /api/recents/searches adds a new search", async () => {
    const payload = { query: "ramen" };
    const res = await request(app).post("/api/recents/searches").send(payload);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("items");
    expect(res.body.items[0]).to.include({ query: "ramen" });
  });
  it("POST /api/recents/searches rejects missing or empty query", async () => {
    const res = await request(app)
      .post("/api/recents/searches")
      .send({ query: "" });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.match(/query/i);
  });
  it("POST /api/recents/searches dedupes existing searches", async () => {
    await request(app).post("/api/recents/searches").send({ query: "taco" });
    const res = await request(app)
      .post("/api/recents/searches")
      .send({ query: "TACO" });
    expect(res.status).to.equal(201);
    expect(res.body.items).to.have.length(1);
    expect(res.body.items[0].query).to.equal("TACO");
  });
  it("GET /api/recents/searches shows newest first", async () => {
    await request(app).post("/api/recents/searches").send({ query: "noodles" });
    await request(app).post("/api/recents/searches").send({ query: "sushi" });
    const res = await request(app).get("/api/recents/searches");
    expect(res.body.items.map((i) => i.query)).to.deep.equal([
      "sushi",
      "noodles",
    ]);
  });
  it("Caps results to the most recent 10", async () => {
    for (let i = 0; i < 12; i++) {
      await request(app)
        .post("/api/recents/searches")
        .send({ query: `food${i}` });
    }
    const res = await request(app).get("/api/recents/searches");
    expect(res.body.items).to.have.length(10);
  });
});
