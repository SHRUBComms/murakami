// /api/get/members

const router = require("express").Router();

router.use("/transactions", require("./transactions"));
router.use("/carbon-saved", require("./carbon-saved"));
router.use("/balance", require("./balance"));
router.use("/remove", require("./remove"));
router.use("/restore", require("./restore"));
router.use("/destroy", require("./destroy"));
router.use("/sign-up-info", require("./sign-up-info"));
router.use("/id-remind", require("./id-remind"));
router.use("/basic-details", require("./basic-details"));

module.exports = router;
