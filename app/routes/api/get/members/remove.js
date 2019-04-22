// /api/get/members/remove

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("members", "revokeMembership"),
  function(req, res) {
    var member_id = req.params.member_id;
    Members.getById(req.params.member_id, req.user, function(err, member) {
      if (
        req.user.permissions.members.revokeMembership == true ||
        (req.user.permissions.members.revokeMembership ==
          "commonWorkingGroup" &&
          Helpers.hasOneInCommon(
            req.user.working_groups,
            member.working_groups
          ))
      ) {
        Members.updateStatus(member_id, 0, function(err) {
          if (err) {
            req.flash("error_msg", "Something went wrong!");
          } else {
            req.flash("success_msg", "Membership revoked!");
          }
          res.redirect(
            process.env.PUBLIC_ADDRESS + "/members/view/" + member_id
          );
        });
      } else {
        req.flash(
          "error_msg",
          "You don't have permission to revoke membership!"
        );
        res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + member_id);
      }
    });
  }
);

module.exports = router;
