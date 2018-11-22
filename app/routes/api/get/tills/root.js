// /api/get/transactions

var router = require("express").Router();

router.use("/transactions", require("./transactions"));
router.use("/categories", require("./categories"));

module.exports = router;
