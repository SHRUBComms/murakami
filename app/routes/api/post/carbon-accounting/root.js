// /api/post/carbon-accounting

const router = require("express").Router();

router.use("/report", require("./report"));

module.exports = router;
