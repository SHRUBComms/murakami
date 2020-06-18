// /api/post/volunteers/food-collections

var router = require("express").Router();

router.use("/get-by-member-id", require("./get-by-member-id"));
router.use("/update", require("./update"));
router.use("/send-link", require("./send-link"));
router.use("/disable", require("./disable"));
router.use("/get-organisations", require("./get-organisations"));

module.exports = router;
