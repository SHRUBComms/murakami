// /api/get/reports

const router = require("express").Router();

router.use("/all-time", require("./all-time/root"));

module.exports = router;
