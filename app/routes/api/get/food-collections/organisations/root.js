// /api/get/food-collections/organisations

const router = require("express").Router();

router.use("/change-active-status", require("./change-active-status"));

module.exports = router;
