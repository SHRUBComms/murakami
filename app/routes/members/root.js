// /members

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  Members.getAll(function(err, members) {
    WorkingGroups.getAll(function(err, allWorkingGroups) {
      async.eachOf(
        members,
        function(member, i, callback) {
          Members.makeNice(members[i], allWorkingGroups, function(member) {
            members[i] = member;
            callback();
          });
        },
        function(err) {
          res.render("members/all", {
            title: "Manage Members",
            members: members,
            membersActive: true
          });
        }
      );
    });
  });
});

router.use("/add", require("./add"));
router.use("/update", require("./update"));
router.use("/view", require("./view"));
router.use("/volunteer-info", require("./volunteer-info"));

module.exports = router;
