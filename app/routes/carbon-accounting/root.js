// /carbon-accounting

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  res.redirect(process.env.PUBLIC_ADDRESS + "/carbon-accounting/log");
});

router.use("/log", require("./log"));
router.use("/export", require("./export"));
router.use("/settings", require("./settings"));
router.use("/raw-csv-export", require("./raw-csv-export"));

module.exports = router;
