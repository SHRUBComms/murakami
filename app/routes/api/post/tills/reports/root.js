// /api/post/tills/reports

const router = require("express").Router();

router.use("/quick-summary", require("./quick-summary"));
router.use("/transactions", require("./transactions"));
router.use("/floats", require("./floats"));
router.use("/revenue", require("./revenue"));
router.use("/unit-sales", require("./unit-sales"));
router.use("/stock-records", require("./stock-records"));

module.exports = router;
