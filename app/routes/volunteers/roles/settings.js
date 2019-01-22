// /volunteers/roles/settings

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Volunteers = require(rootDir + "/app/models/volunteers");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/:role_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff"]),
  function(req, res) {

  }
);

module.exports = router;
