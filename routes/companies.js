const express = require("express");
const router = express.Router();

const db = require("../db.js");
const { NotFoundError } = require("../expressError.js");


/** 
 * GET list of companies / => {companies: [{code, name}, ...]} 
 * */

router.get("/", async function (req, res, next) {

  const result = await db.query(
    `SELECT code, name FROM companies ORDER BY code`
  );

  const companies = result.rows;

  return res.json({ companies });
});

/** 
 * GET a company with company code / => {company: {code, name, description,
 * invoices:[id,id,id]}} 
 * */

router.get("/:code", async function (req, res, next) {

  const compCode = req.params.code;
  const result = await db.query(
    `SELECT code, name, description 
    FROM companies 
    WHERE code = $1`, [compCode]
  );

  const company = result.rows[0];

  if(!company){
    throw new NotFoundError(`company '${compCode}' does not exist`);
  };

  const invoiceResult = await db.query(
    `SELECT id 
    FROM invoices
    WHERE comp_code = $1
    ORDER BY id`,[compCode]
  );

  const companyInvoices = invoiceResult.rows;
  
  const invoiceIds = companyInvoices.map(n => n.id);

  company.invoices = invoiceIds;

  return res.json({ company });
});

/** 
 * POST Create new company, return {company: {code, name, description}} 
 * */

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

/** PUT Edit existing company details, return {company: {code, name, description}} 
 * or 404 if not found 
 * */

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

/** 
 * DELETE a company, return {status: "deleted"} or 404 if company not found
 * */
router.delete("/:code", async function (req, res, next) {
  const compCode = req.params.code;

  const result = await db.query(
    `DELETE FROM companies 
    WHERE code=$1 
    RETURNING code`, [compCode]);

  if (!result.rows[0]) throw new NotFoundError(`${compCode} is not found`);

  return res.json({ status: "deleted" });
});

module.exports = router;