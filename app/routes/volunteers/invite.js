// volunteers/invite

var router = require("express").Router();
var async = require("async");
var validator = require("email-validator");

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var Members = require(rootDir + "/app/models/members");
var Volunteers = require(rootDir + "/app/models/volunteers");
var VolunteerRoles = require(rootDir + "/app/models/volunteer-roles");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    var errors = [];

    if (req.query.callback != "true") {
      errors = [
        {
          msg:
            "If possible, you should add volunteers in person. Please use this feature wisely!"
        }
      ];
    }
    res.render("volunteers/invite", {
      title: "Invite Volunteer",
      volunteersActive: true,
      errors: errors
    });
  }
);

router.post("/", Auth.isLoggedIn, Auth.isOfClass(["god"]), function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var action;
  if (email) {
    if (validator.validate(email)) {
      Members.getByEmail(email, function(err, member) {
        if (!member[0]) {
          action = "add-volunteer";
        } else if (member[0] && !member[0].volInfo) {
          action = "make-volunteer";
          member = member[0];
        }

        if (action) {
          Volunteers.createInvite(
            action,
            member.member_id || null,
            req.user,
            function(err, inviteLink) {
              if (err) {
                req.flash("error_msg", "Something went wrong!");
                res.redirect(
                  process.env.PUBLIC_ADDRESS +
                    "/volunteers/invite?callback=true"
                );
              } else {
                Mail.sendGeneral(
                  name + " <" + email + ">",
                  "You've been invited to register as a volunteer!",
                  "<p>Follow the link to register as a volunteer " +
                    inviteLink +
                    "</p>",
                  function(err) {
                    if (err) {
                      req.flash(
                        "error_msg",
                        "Something went wrong sending the email! Manually send the link " +
                          inviteLink
                      );
                      res.redirect(
                        process.env.PUBLIC_ADDRESS +
                          "/volunteers/invite?callback=true"
                      );
                    } else {
                      req.flash("success_msg", "Invite sent successfully!");
                      res.redirect(
                        process.env.PUBLIC_ADDRESS +
                          "/volunteers/invite?callback=true"
                      );
                    }
                  }
                );
              }
            }
          );
        } else {
          req.flash("error_msg", "Member already exists!");
          res.redirect(
            process.env.PUBLIC_ADDRESS + "/members/view/" + member_id
          );
        }
      });
    } else {
      req.flash("error_msg", "Please enter a valid email address");
      res.redirect(
        process.env.PUBLIC_ADDRESS + "/volunteers/invite?callback=true"
      );
    }
  } else {
    req.flash("error_msg", "Please enter an email address");
    res.redirect(
      process.env.PUBLIC_ADDRESS + "/volunteers/invite?callback=true"
    );
  }
});

module.exports = router;
