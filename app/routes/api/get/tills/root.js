// /api/get/transactions

const router = require("express").Router();

router.use("/transactions", require("./transactions"));
router.use("/categories", require("./categories"));
router.use("/smp-callback", require("./smp-callback"));
router.use("/cash-total", require("./cash-total"));
router.use("/stock", require("./stock/root"));

module.exports = router;
