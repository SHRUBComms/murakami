// /members

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  Members.getTotals(function(err, total) {
    Members.getAll(function(err, members) {
      async.eachOf(
        members,
        function(member, i, callback) {
          Members.sanitizeMember(members[i], req.user, function(err, member) {
            members[i] = member;
            callback();
          });
        },
        function(err) {
          res.render("members/all", {
            title: "Manage Members",
            members: members,
            membersActive: true,
            total: total[0]
          });
        }
      );
    });
  });
});

router.use("/add", require("./add"));
router.use("/update", require("./update"));
router.use("/update-basic", require("./update-basic"));
router.use("/view", require("./view"));
router.use("/make-volunteer", require("./make-volunteer"));

module.exports = router;
