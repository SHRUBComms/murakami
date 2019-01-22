// /members/view

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:member_id", Auth.isLoggedIn, function(req, res) {
  Members.getById(req.params.member_id, req.user, function(err, member) {
    if (err || !member) {
      req.flash("error_msg", "Member not found!");
      res.redirect(process.env.PUBLIC_ADDRESS + "/members");
    } else {
      res.render("members/view", {
        title: "View Member",
        membersActive: true,
        member: member,
        till: {
          till_id: req.query.till_id
        }
      });

    }
  });
});

module.exports = router;
