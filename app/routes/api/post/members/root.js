// /api/post/members

const router = require("express").Router();

router.use("/search", require("./search"));
router.use("/update-barcode", require("./update-barcode"));
//router.use("/remote-add", require("./remote-add"));
router.use("/report", require("./report"));

module.exports = router;
