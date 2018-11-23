// /members/view

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:member_id", Auth.isLoggedIn, function(req, res) {
  Members.getById(req.params.member_id, function(err, member) {
    if (err || !member[0]) {
      req.flash("error_msg", "Member not found!");
      res.redirect("/members");
    } else {
      Members.getVolInfoById(req.params.member_id, function(err, volInfo) {
        WorkingGroups.getAll(function(err, allWorkingGroups) {
          Members.makeNice(member[0], allWorkingGroups, function(member) {
            res.render("members/view", {
              title: "View Member",
              member: member,
              allWorkingGroups: allWorkingGroups,
              membersActive: true,
              volInfo: volInfo,
              diode_api_key: process.env.DIODE_API_KEY
            });
          });
        });
      });
    }
  });
});

module.exports = router;
