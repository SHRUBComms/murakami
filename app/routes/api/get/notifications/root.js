// /api/get/notifications

var router = require("express").Router();

router.use("/read", require("./read"));

module.exports = router;
