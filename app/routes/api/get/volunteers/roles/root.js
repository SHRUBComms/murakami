// /api/get/volunteers/roles

var router = require("express").Router();

router.use("/toggle-privacy", require("./toggle-privacy"));
router.use("/remove", require("./remove"));
router.use("/activate", require("./activate"));

module.exports = router;
