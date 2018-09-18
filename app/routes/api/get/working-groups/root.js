// /api/get/working-groups

var router = require("express").Router();

router.use("/members", require("./members/root"));
router.use("/join-requests", require("./join-requests/root"));
router.use("/volunteer-hours", require("./volunteer-hours/root"));

module.exports = router;