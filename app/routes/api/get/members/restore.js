// /api/get/members/restore

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("members", "revokeMembership"),
  function(req, res) {
    var member_id = req.params.member_id;
    Members.getById(member_id, req.user, function(err, member) {
      if (
        req.user.permissions.members.revokeMembership == true ||
        (req.user.permissions.members.revokeMembership ==
          "commonWorkingGroup" &&
          Helpers.hasOneInCommon(
            req.user.working_groups,
            member.working_groups
          ))
      ) {
        Members.updateStatus(member_id, 1, function(err) {
          if (err) {
            req.flash("error_msg", "Something went wrong!");
            res.redirect(
              process.env.PUBLIC_ADDRESS + "/members/view/" + member_id
            );
          } else {
            req.flash(
              "success_msg",
              "Marked as current member - if membership has expired, member will be marked as not a member at 9.30am!"
            );
            res.redirect(
              process.env.PUBLIC_ADDRESS + "/members/view/" + member_id
            );
          }
        });
      }
    });
  }
);

module.exports = router;
