// /api/get

var router = require("express").Router();

router.use("/members", require("./members/root"))
router.use("/reports", require("./reports/root"))
router.use("/working-groups", require("./working-groups/root"))

module.exports = router;