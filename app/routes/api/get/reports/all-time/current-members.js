// /api/get/reports/all-time/current-members

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  Members.getAllCurrentMembers(function(err, members) {
    res.send(members.length.toString());
  });
});

router.get("/:group_id", function(req, res) {
  WorkingGroups.getAllMembersByGroup(req.params.group_id, function(
    err,
    members
  ) {
    res.send(members.length.toString());
  });
});

module.exports = router;
