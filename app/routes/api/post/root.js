// /api/post

var router = require("express").Router();

router.use("/members", require("./members/root"));
router.use("/working-groups", require("./working-groups/root"));
router.use("/tills", require("./tills/root"));
router.use("/volunteers", require("./volunteers/root"));

module.exports = router;
