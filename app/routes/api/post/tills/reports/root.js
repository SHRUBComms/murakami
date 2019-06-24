// /api/post/tills/reports

var router = require("express").Router();

router.use("/quick-summary", require("./quick-summary"));
router.use("/transactions", require("./transactions"));
router.use("/floats", require("./floats"));
router.use("/unit-sales", require("./unit-sales"));

module.exports = router;
