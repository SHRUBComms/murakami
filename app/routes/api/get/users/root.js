// /api/get/users

var router = require("express").Router();

router.use("/last-login", require("./last-login"));

module.exports = router;
