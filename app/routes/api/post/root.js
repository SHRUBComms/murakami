// /api/post

var router = require("express").Router();

router.use("/members", require("./members/root"))
router.use("/working-groups", require("./working-groups/root"))

module.exports = router;