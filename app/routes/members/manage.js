// /members/manage

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Members = Models.Members;
var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.canAccessPage("members", "view"), function(req, res) {
  Members.getTotals(function(err, total) {
    Members.getAll(function(err, members) {
      var sanitizedMembers = [];
      async.eachOf(
        members,
        function(member, i, callback) {
          Members.sanitizeMember(member, req.user, function(
            err,
            sanitizedMember
          ) {
            if (sanitizedMember) {
              sanitizedMembers.push(sanitizedMember);
            }
            callback();
          });
        },
        function(err) {
          res.render("members/manage", {
            title: "Manage Members",
            members: sanitizedMembers,
            membersActive: true,
            total: total[0]
          });
        }
      );
    });
  });
});

module.exports = router;
