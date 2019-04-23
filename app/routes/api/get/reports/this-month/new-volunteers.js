// /api/get/reports/this-month/new-volunteers

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  Members.getNewVolsThisMonth(function(err, members) {
    res.send(members.length.toString());
  });
});

module.exports = router;
