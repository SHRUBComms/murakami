// /api/get/food-collections/organisations

var router = require("express").Router();

router.use("/mark-as-active", require("./mark-as-active"));
router.use("/mark-as-inactive", require("./mark-as-inactive"));

module.exports = router;
