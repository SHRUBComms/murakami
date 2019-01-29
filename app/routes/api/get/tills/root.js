// /api/get/transactions

var router = require("express").Router();

router.use("/transactions", require("./transactions"));
router.use("/categories", require("./categories"));
router.use("/smp-callback", require("./smp-callback"));
router.use("/reports", require("./reports/root"));

module.exports = router;
