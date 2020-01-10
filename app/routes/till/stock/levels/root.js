// /till/stock/levels

var router = require("express").Router();

var rootDir = process.env.CWD;
var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  res.redirect(process.env.PUBLIC_ADDRESS + "/till/select");
});

router.use("/manage", require("./manage"));
router.use("/view", require("./view"));

module.exports = router;