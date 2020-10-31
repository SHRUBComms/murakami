// /api

const router = require("express").Router();

router.use("/post", require("./post/root"));
router.use("/get", require("./get/root"));

module.exports = router;
