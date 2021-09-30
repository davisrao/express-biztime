const express = require("express");
const router = express.Router();

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");

/** 
 * GET list of invoices / => {invoices: [{id, comp_code}, ...]} 
 * */

router.get("/", async function (req, res, next) {

  const result = await db.query(
    `SELECT id, comp_code FROM invoices ORDER BY id`
  );

  const invoices = result.rows;

  return res.json({ invoices });
});

/** GET a particular invoice by id / => 
 * {invoice: {id, amt, paid, add_date, paid_date, 
 * company: {code, name, description}} 
 * */

router.get("/:id", async function (req, res, next) {
  const id = req.params.id;

  const iResult = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
    FROM invoices 
    WHERE id = $1 
    ORDER BY id`, [id]
  );

  const invoice = iResult.rows[0];

  if(!invoice){
    throw new NotFoundError(`invoice ${id} not found`)
  }

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

/** POST an invoice with comp_code + id and return
 {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
*/
router.post("/", async function (req, res, next) {
  const { comp_code, amt } = req.body;

  const companyResult = await db.query(
    `SELECT code, name 
    FROM companies
    WHERE code = $1`, [comp_code]
  )

  if(!companyResult.rows[0]){
    throw new NotFoundError(`Can't add invoice to non-existent code: ${comp_code}`)
  }

  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
           VALUES ($1, $2)
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]
  );
  const invoice = result.rows[0];
  return res.status(201).json({ invoice });
});


/** PUT Edit existing invoice details, 
 * return {invoice: {id, comp_code, amt, 
 *                  paid, add_date, paid_date}}
 * or 404 if not found 
 * */

router.put("/:id", async function (req, res, next) {
  const { amt } = req.body;
  const id = req.params.id;

  const result = await db.query(
    `UPDATE invoices
           SET amt = $1
           WHERE id = $2
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, id]
  );
  const invoice = result.rows[0];

  if (!invoice) throw new NotFoundError(`${id} is not found`);

  return res.status(201).json({ invoice });
});

/** 
 * DELETE an invoice, return {status: "deleted"} or 404 if invoice not found
 * */
router.delete("/:id", async function (req, res, next) {
  const id = req.params.id;

  const result = await db.query(
    `DELETE FROM invoices 
    WHERE id=$1 
    RETURNING id, comp_code, amt`, [id]);

  if (!result.rows[0]) throw new NotFoundError(`Invoice ${id} is not found`);

  return res.json({ status: "deleted" });
});



module.exports = router;