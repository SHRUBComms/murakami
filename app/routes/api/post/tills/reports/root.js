// /api/post/tills/reports

var router = require("express").Router();

router.use("/quick-summary", require("./quick-summary"));
router.use("/transactions", require("./transactions"));
router.use("/floats", require("./floats"));

module.exports = router;
