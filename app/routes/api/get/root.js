// /api/get

var router = require("express").Router();

router.use("/members", require("./members/root"));
router.use("/reports", require("./reports/root"));
router.use("/users", require("./users/root"));
router.use("/tills", require("./tills/root"));
router.use("/notifications", require("./notifications/root"));
router.use("/volunteers", require("./volunteers/root"));
router.use("/food-collections", require("./food-collections/root"));

module.exports = router;
