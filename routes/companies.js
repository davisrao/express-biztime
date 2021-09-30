const express = require("express");
const router = express.Router();

const db = require("../db.js")


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

/** Create new company, return company */

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

module.exports = router;