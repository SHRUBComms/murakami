// /api/get/reports

var router = require("express").Router();

router.use("/this-year", require("./this-year/root"));
router.use("/this-month", require("./this-month/root"));
router.use("/all-time", require("./all-time/root"));
router.use("/today", require("./today/root"));

module.exports = router;
