// /api/get/volunteers

var router = require("express").Router();

router.use("/roles", require("./roles/root"));
router.use("/hours", require("./hours/root"));

module.exports = router;
