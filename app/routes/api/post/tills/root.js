// /api/post/tills

const router = require("express").Router();

router.use("/categories", require("./categories/root"));
router.use("/reports", require("./reports/root"));
router.use("/stock", require("./stock/root"));
router.use("/update", require("./update"));

module.exports = router;
