// /api/get/reports/all-time

var router = require("express").Router();

router.use("/current-members", require("./current-members"));
router.use("/current-volunteers", require("./current-volunteers"));

module.exports = router;
