// /api/get/reports/this-month

var router = require("express").Router();

router.use("/hours-volunteered", require("./hours-volunteered"));
router.use("/new-volunteers", require("./new-volunteers"));
router.use("/new-members", require("./new-members"));

module.exports = router;
