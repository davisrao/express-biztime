const express = require("express");
const router = express.Router();

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");


/** GET list of companies / => {companies: [{code, name}, ...]} */

router.get("/", async function (req, res, next) {
  //select all from DB
  // return list of all per below

  const result = await db.query(
    `SELECT * FROM companies`
  );

  const companies = result.rows;

  return res.json({ companies });
});

/** GET a company with company code / => {company: {code, name, description}} */
router.get("/:code", async function (req, res, next) {
  //select using company code
  const compCode = req.params.code;
  const result = await db.query(
    `SELECT code, name, description 
    FROM companies 
    WHERE code = $1`, [compCode]
  );

  const company = result.rows[0];

  return res.json({ company });
});

/** Create new company, return {company: {code, name, description}} */

router.post("/", async function (req, res, next) {
  const { code, name, description } = req.body;

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
    [code, name, description],
  );
  const company = result.rows[0];
  return res.status(201).json({ company });
});

/** Edit existing company details, return {company: {code, name, description}} 
 * or 404 if not found */
router.put("/:code", async function (req, res, next) {
  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
           SET name = $1,
               description = $2
           WHERE code = $3
           RETURNING code, name, description`,
    [name, description, req.params.code]
  );
  const company = result.rows[0];

  if (!company) throw new NotFoundError(`${req.params.code} is not found`);

  return res.status(201).json({ company });
});

/** Delete company, return {status: "deleted"} or 404 if company not found*/
router.delete("/:code", async function (req, res, next) {
  const compCode = req.params.code;

  const result = await db.query("SELECT * FROM companies WHERE code=$1", [compCode]);
  console.log(result);
  if (!result.rows[0]) throw new NotFoundError(`${compCode} is not found`);

  await db.query("DELETE FROM companies WHERE code=$1", [compCode]);
  return res.json({ status: "deleted" })
});

module.exports = router;