// /api/post/tills/categories

const router = require("express").Router();

router.use("/add", require("./add"));
router.use("/search", require("./search"));
router.use("/move", require("./move"));
router.use("/remove", require("./remove"));
router.use("/update", require("./update"));
router.use("/discounts", require("./discounts/root"));

module.exports = router;
