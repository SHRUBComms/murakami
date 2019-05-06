// /members

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "volunteer", "staff"]),
  function(req, res) {
    res.redirect(process.env.PUBLIC_ADDRESS + "/members/manage");
  }
);

router.use("/add", require("./add"));
router.use("/manage", require("./manage"));
router.use("/update", require("./update"));
router.use("/update-basic", require("./update-basic"));
router.use("/view", require("./view"));
router.use("/make-volunteer", require("./make-volunteer"));

module.exports = router;
