// /api/post/tills/stock/levels

const router = require("express").Router();

router.use("/update", require("./update"));

module.exports = router;
