// /api/get/tills/smp-remove-failed

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

//var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  // Check transaction status via SumUp API
  console.log("triggered");
  res.redirect(
    decodeURIComponent(req.query["murakami-callback"]) +
      "&smp-status=" +
      req.query["smp-status"] +
      "&smp-failure-cause=" +
      req.query["smp-failure-cause"]
  );
});

module.exports = router;
