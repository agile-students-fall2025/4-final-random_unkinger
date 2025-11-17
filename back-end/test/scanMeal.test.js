const request = require("supertest");
const {expect } = require("chai")
const app = require("../server")


describe ("Scan Meal API", () => {
    it("check if the database is up and running", async () => {
        const res = await request(app).get("/api/barcode/5449000000996");
        expect(res.status).to.equal(200);
    })

    it("check for valid product name", async () => {
        const res = await request(app).get("/api/barcode/5449000000996");
        expect(res.status).to.equal(200);

        expect(res.body).to.have.property("name");
        expect(res.body.name).to.equal("Cola Cola Original Taste")
    })

    it("check for valid product nutrition", async () => {
        const res = await request(app).get("/api/barcode/5449000000996");
        expect(res.status).to.equal(200);

        expect(res.body).to.have.property("calories");
        expect(res.body.calories).to.equal(44);

        expect(res.body).to.have.property("protein");
        expect(res.body.protein).to.equal(0)

        expect(res.body).to.have.property("carbs");
        expect(res.body.carbs).to.equal(10.6);

    })
})