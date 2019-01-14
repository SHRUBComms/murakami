// /api/get/volunteers

var router = require("express").Router();

router.use("/roles", require("./roles/root"));

module.exports = router;
