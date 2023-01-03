// /api/post

const router = require("express").Router();

router.use("/members", require("./members/root"));
router.use("/tills", require("./tills/root"));
router.use("/volunteers", require("./volunteers/root"));
router.use("/carbon-accounting", require("./carbon-accounting/root"));

module.exports = router;
