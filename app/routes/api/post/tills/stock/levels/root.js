// /api/post/tills/stock/levels

var router = require("express").Router();

router.use("/update", require("./update"));

module.exports = router;
