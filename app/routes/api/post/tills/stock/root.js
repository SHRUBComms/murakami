// /api/post/tills/stock

var router = require("express").Router();

router.use("/levels", require("./levels/root"));

module.exports = router;
