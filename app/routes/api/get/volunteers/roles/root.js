// /api/get/volunteers/roles

const router = require("express").Router();

router.use("/toggle-privacy", require("./toggle-privacy"));
router.use("/remove", require("./remove"));
router.use("/activate", require("./activate"));
router.use("/get-public", require("./get-public"));

module.exports = router;
