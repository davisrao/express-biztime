const express = require("express");
const router = express.Router();

const db = require("../db.js")


/** GET list of companies / => {companies: [{code, name}, ...]} */

router.get("/", async function (req, res, next){
    //select all from DB
    // return list of all per below

    const result = await db.query(
        `SELECT * FROM companies`
    );

    const companies = result.rows;

    return res.json({companies});
  });


  module.exports = router;