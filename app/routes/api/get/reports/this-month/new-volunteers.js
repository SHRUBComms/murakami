// /api/get/reports/this-month/new-volunteers

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  Members.getNewVolsThisMonth(function(err, members) {
    res.send(members.length.toString());
  });
});

module.exports = router;
