// /api/get/transactions/reports/sales

var router = require("express").Router();

router.use("/by-working-group", require("./by-working-group"));
router.use("/by-till", require("./by-till"));
router.use("/memberships", require("./memberships"));

module.exports = router;
