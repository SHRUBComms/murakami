// /api/get/reports/this-year

var router = require("express").Router();

router.use("/carbon-saved", require("./carbon-saved"));

module.exports = router;
