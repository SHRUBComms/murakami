// /api/get/reports/this-month/new-members

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

router.get("/:group_id", function(req, res) {
  WorkingGroups.getNewMembersByGroupId(req.params.group_id, function(
    err,
    members
  ) {
    res.send(members.length.toString());
  });
});

module.exports = router;
