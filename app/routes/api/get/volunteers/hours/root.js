// /api/get/volunteers/hours

const router = require("express").Router();

router.use("/by-member-id", require("./by-member-id"));

module.exports = router;
