// /api/get/members/id-remind

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff"]),
  function(req, res) {
    Members.getById(req.params.member_id, { class: "admin" }, function(
      err,
      member
    ) {
      if (!member || err) {
        req.flash("error", "Member not found");
        res.redirect("/members");
      } else {
        Mail.sendAutomated("membership_id_reminder", member.member_id, function(
          err
        ) {
          if (err) {
            console.log(err);
            req.flash("error", "Something went wrong!");
            res.redirect("/members");
          } else {
            req.flash("success_msg", "Volunteer has been sent their ID");
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/volunteers/view/" +
                req.params.member_id
            );
          }
        });
      }
    });
  }
);

module.exports = router;
