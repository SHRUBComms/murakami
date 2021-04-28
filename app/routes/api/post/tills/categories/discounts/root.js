// /api/post/tills/categories/discounts

const router = require("express").Router();

router.use("/add", require("./add"));
router.use("/update", require("./update"));

module.exports = router;
