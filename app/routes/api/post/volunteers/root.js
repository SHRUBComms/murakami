// /api/post/volunteers

var router = require("express").Router();

router.use("/existence", require("./existence"));
router.use("/roles", require("./roles/root"));

module.exports = router;
