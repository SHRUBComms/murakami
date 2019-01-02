// /api/get/notifications

var router = require("express").Router();

router.use("/read", require("./read"));
router.use("/read-all", require("./read-all"));
router.use("/unread", require("./unread"))

module.exports = router;
