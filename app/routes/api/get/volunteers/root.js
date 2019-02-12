// /api/get/volunteers

var router = require("express").Router();

router.use("/mark-as-inactive", require("./mark-as-inactive"));
router.use("/mark-as-active", require("./mark-as-active"));
router.use("/roles", require("./roles/root"));

module.exports = router;
