// /api/post/tills/stock

const router = require("express").Router();

router.use("/levels", require("./levels/root"));

module.exports = router;
