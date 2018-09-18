// /api/get/members

var router = require("express").Router();

router.use("/transactions", require("./transactions"));
router.use("/carbon-saved", require("./carbon-saved"));
router.use("/balance", require("./balance"));
router.use("/renew", require("./renew"));
router.use("/remove", require("./remove"));
router.use("/restore", require("./restore"));
router.use("/destroy", require("./destroy"));
router.use("/id-remind", require("./id-remind"));


module.exports = router;