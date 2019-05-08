// /food-collections

var router = require("express").Router();

router.use("/log", require("./log"));
router.use("/export", require("./export"));
router.use("/review", require("./review"));
router.use("/organisations", require("./organisations/root"));

module.exports = router;
