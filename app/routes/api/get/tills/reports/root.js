// /api/get/transactions/reports

var router = require("express").Router();

router.use("/sales", require("./sales/root"));

module.exports = router;
