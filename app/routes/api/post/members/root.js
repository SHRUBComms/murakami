// /api/post/members

var router = require("express").Router();

router.use("/search", require("./search"));
router.use("/update-barcode", require("./update-barcode"));

module.exports = router;
