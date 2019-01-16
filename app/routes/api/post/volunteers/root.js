// /api/post/volunteers

var router = require("express").Router();

router.use("/existence", require("./existence"));

module.exports = router;
