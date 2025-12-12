const request = require("supertest");
const { expect } = require("chai");
const app = require("../server");

describe("Scan Meal API", () => {
  it("check if the database is up and running", async () => {
    const res = await request(app).get("/api/barcode/5449000000996");
    expect(res.status).to.equal(200);
  }).timeout(10000);

  it("check for valid product name", async () => {
    const res = await request(app).get("/api/barcode/5449000000996");
    expect(res.status).to.equal(200);

    expect(res.body).to.have.property("name");
    expect(res.body.name).to.equal("Coca Cola");
  }).timeout(10000);
});
