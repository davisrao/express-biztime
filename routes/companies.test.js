const express = require("express");
const router = express.Router();
const request = require("supertest")
const app = require("../app")

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

let invoiceId;
beforeEach(async function () {
  await db.query("DELETE FROM companies");
  let result = await db.query(`
    INSERT INTO companies (code,name,description)
        VALUES ('testco', 'test company', 'this is the test company 1')
        `);
  await db.query(`
    INSERT INTO invoices (comp_code, amt)
    VALUES ('testco', '10')`)
});

/** GET /companies - returns {companies: [{code, name}, ...]} */

describe("GET /companies", function () {
  test("Gets a list of companies", async function () {
    const resp = await request(app).get(`/companies`);
    expect(resp.body).toEqual({
      companies: [{ code: "testco", name: "test company" }]
    });
  });
});

/** GET /companies/:code - 
 * returns {company: {code, name, description, invoices:[id,id,id]}} 
 * or 404 */

describe("GET /companies/:code", function () {
  test("Get company details", async function () {
    const resp = await request(app).get(`/companies/testco`);

    expect(resp.body).toEqual({
      company: {
        code: "testco",
        name: "test company",
        description: "this is the test company 1",
        invoices: [expect.any(Number)]
      }
    });
  });

  test("Invalid company for company details", async function () {
    const resp = await request(app).get(`/companies/invalidCompany`);

    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({ "error": { "message": "company 'invalidCompany' does not exist", "status": 404 } })
  });
});

/** 
 * POST Create new company, return {company: {code, name, description}} 
 * */

describe("POST /companies", function () {
  test("Creates a new company", async function () {
    const companiesBeforePost = (await db.query("SELECT code FROM companies")).rows
    const numCompaniesBefore = companiesBeforePost.length;
    const resp = await request(app).post(`/companies`)
      .send({
        code: "test2",
        name: "test company 2",
        description: "this is a new test company"
      });

    const companiesAfterPost = (await db.query("SELECT code FROM companies")).rows
    const numCompaniesAfter = companiesAfterPost.length;

    expect(resp.body).toEqual({
      company: { code: "test2", name: "test company 2", description: "this is a new test company" }
    });
    expect(numCompaniesAfter).toEqual(numCompaniesBefore + 1);
  });
});