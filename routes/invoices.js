const express = require("express");
const router = express.Router();

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

/** GET list of invoices / => {invoices: [{id, comp_code}, ...]} */

router.get("/", async function (req, res, next) {

  const result = await db.query(
    `SELECT id, comp_code FROM invoices`
  );

  const invoices = result.rows;

  return res.json({ invoices });
});

/** GET a particular invoice by id / => 
 * {invoice: {id, amt, paid, add_date, paid_date, 
 * company: {code, name, description}} */

router.get("/:id", async function (req, res, next) {

  const iResult = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
    FROM invoices 
    WHERE id = $1 
    ORDER BY id`, [req.params.id]
  );

  const invoice = iResult.rows[0];

  const cResult = await db.query(
    `SELECT code, name, description 
    FROM companies
    WHERE code = $1`, [invoice.comp_code]
  )

  const company = cResult.rows[0];
  invoice.company = company;
  delete invoice.comp_code;

  return res.json({ invoice });
});

module.exports = router;