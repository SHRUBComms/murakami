// /api/post/tills

var router = require("express").Router();

router.use("/categories", require("./categories/root"));
router.use("/update", require("./update"));

module.exports = router;
