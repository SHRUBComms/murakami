// /api/get/members/id-remind

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail/root");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "view"),
  function(req, res) {
    Members.getById(
      req.params.member_id,
      { permissions: { members: { contactDetails: true, name: true } } },
      function(err, member) {
        if (!member || err) {
          req.flash("error", "Member not found");
          res.redirect(process.env.PUBLIC_ADDRESS + "/members");
        } else {
          Mail.sendAutomated(
            "membership_id_reminder",
            member.member_id,
            function(err) {
              if (err) {
                req.flash("error", "Something went wrong!");
                res.redirect(process.env.PUBLIC_ADDRESS + "/members");
              } else {
                req.flash("success_msg", "Volunteer has been sent their ID");
                res.redirect(
                  process.env.PUBLIC_ADDRESS +
                    "/volunteers/view/" +
                    req.params.member_id
                );
              }
            }
          );
        }
      }
    );
  }
);

module.exports = router;
