const express = require("express");
const router = express.Router();

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");


beforeEach(async function () {
  await db.query("DELETE FROM cats");
  let result = await db.query(`
    INSERT INTO companies (code,name,description)
        VALUES ("testco", "test company", "this is the test company 1")
        `);

});

/** GET /items - returns `{items: [item, ...]}` */

describe("GET /companies", function () {
    test("Gets a list of companies", async function () {
      const resp = await request(app).get(`/companies`);
      expect(resp.body).toEqual({
        companies: {code:"testco", name:"test company"}
      });
    });
  });
  