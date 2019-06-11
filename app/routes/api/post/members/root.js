// /api/post/members

var router = require("express").Router();

router.use("/search", require("./search"));
router.use("/update-barcode", require("./update-barcode"));
router.use("/remote-add", require("./remote-add"));

module.exports = router;
