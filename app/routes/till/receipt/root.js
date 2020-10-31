const router = require("express").Router();

router.use("/print", require("./print"));
router.use("/email", require("./email"));

module.exports = router;
