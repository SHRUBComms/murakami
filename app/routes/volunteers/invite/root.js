// volunteers/invite

var router = require("express").Router();
var async = require("async");
var validator = require("email-validator");

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var Members = require(rootDir + "/app/models/members");
var Volunteers = require(rootDir + "/app/models/volunteers");
var VolunteerRoles = require(rootDir + "/app/models/volunteer-roles");
var AccessTokens = require(rootDir + "/app/models/access-tokens");

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

    Users.getCoordinators(req.user, function(err, coordinators) {
      Volunteers.getSignUpInfo(function(
        skills,
        contactMethods,
        roles,
        rolesGroupedByGroup,
        rolesGroupedById,
        volunteerAgreement,
        ourVision,
        saferSpacesPolicy,
        membershipBenefits
      ) {
        res.render("volunteers/invite", {
          title: "Invite Volunteer",
          volunteersActive: true,
          errors: errors,
          coordinators: coordinators,
          roles: rolesGroupedByGroup
        });
      });
    });
  }
);

router.post("/", Auth.isLoggedIn, Auth.isOfClass(["admin", "staff"]), function(
  req,
  res
) {
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var email = req.body.email;
  var roles = req.body.roles;
  var assignedCoordinators = req.body.assignedCoordinators;

  if (first_name && last_name) {
    if (email) {
      if (validator.validate(email)) {
        Users.getCoordinators(req.user, function(
          err,
          coordinators,
          coordinatorsObj,
          coordinatorsFlat
        ) {
          Volunteers.getSignUpInfo(function(
            skills,
            contactMethods,
            rolesObj,
            rolesGroupedByGroup,
            rolesGroupedById
          ) {
            if (!Array.isArray(assignedCoordinators)) {
              assignedCoordinators = [assignedCoordinators];
            }

            if (Helpers.allBelongTo(assignedCoordinators, coordinatorsFlat)) {
              var rolesValid = true;
              if (!Array.isArray(roles)) {
                roles = [roles];
              }
              async.each(
                roles,
                function(role, callback) {
                  if (!rolesGroupedById[role]) {
                    rolesValid = false;
                  }
                  callback();
                },
                function() {
                  if (rolesValid == true) {
                    Members.getByEmail(email, function(err, member) {
                      member = member[0] || null;
                      if (!member || (member && !member.volunteer_id)) {
                        var details = {
                          action: "add-volunteer",
                          user_id: req.user.id
                        };

                        details.roles = roles;
                        details.assignedCoordinators = assignedCoordinators;

                        details.email = email;
                        details.first_name = first_name;
                        details.last_name = last_name;

                        AccessTokens.createToken(details, function(err, token) {
                          if (err || !token) {
                            req.flash("error_msg", "Something went wrong!");
                            res.redirect(
                              process.env.PUBLIC_ADDRESS +
                                "/volunteers/invite?callback=true"
                            );
                          } else {
                            var inviteLink =
                              process.env.PUBLIC_ADDRESS +
                              "/volunteers/invite/" +
                              token;
                            Mail.sendGeneral(
                              first_name + " " + last_name + " <" + email + ">",
                              "You've been invited to register as a volunteer by " +
                                req.user.first_name +
                                " " +
                                req.user.last_name +
                                "!",
                              "<p>Follow the link to register as a volunteer (expires in 24 hours)</p>" +
                                "<p><a href='" +
                                inviteLink +
                                "'>" +
                                inviteLink +
                                "</a>" +
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
                                  req.flash(
                                    "success_msg",
                                    "Invite sent successfully!"
                                  );
                                  res.redirect(
                                    process.env.PUBLIC_ADDRESS +
                                      "/volunteers/invite?callback=true"
                                  );
                                }
                              }
                            );
                          }
                        });
                      } else {
                        req.flash("error_msg", "Volunteer already exists!");
                        res.redirect(
                          process.env.PUBLIC_ADDRESS +
                            "/members/view/" +
                            member.member_id
                        );
                      }
                    });
                  } else {
                    req.flash("error_msg", "Please select valid role(s)!");
                    res.redirect(
                      process.env.PUBLIC_ADDRESS +
                        "/volunteers/invite?callback=true"
                    );
                  }
                }
              );
            } else {
              req.flash(
                "error_msg",
                "Please select a valid staff coordinator!"
              );
              res.redirect(
                process.env.PUBLIC_ADDRESS + "/volunteers/invite?callback=true"
              );
            }
          });
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
  } else {
    req.flash("error_msg", "Please enter a name.");
    res.redirect(
      process.env.PUBLIC_ADDRESS + "/volunteers/invite?callback=true"
    );
  }
});

router.get(
  "/:token",
  Auth.isNotLoggedIn,
  Auth.hasValidToken("add-volunteer"),
  function(req, res) {
    if (res.invite) {
      Users.getCoordinators(req.user, function(
        err,
        coordinators,
        coordinatorsObj,
        coordinatorsFlat
      ) {
        Volunteers.getSignUpInfo(function(
          skills,
          contactMethods,
          roles,
          rolesGroupedByGroup,
          rolesGroupedById,
          volunteerAgreement,
          ourVision,
          saferSpacesPolicy,
          membershipBenefits
        ) {
          Members.getByEmail(res.invite.details.email, function(err, member) {
            member = member[0] || null;

            console.log(err, member);
            if (member) {
              if (!member.volunteer_id) {
                res.render("members/make-volunteer", {
                  title: "Add Volunteer (Existing Member)",
                  member: member,
                  assignedRoles: res.invite.details.roles,
                  assignedCoordinators: res.invite.details.assignedCoordinators,
                  invite: res.invite,
                  coordinators: coordinatorsObj,
                  roles: rolesGroupedById,
                  skills: skills,
                  volunteerAgreement: volunteerAgreement,
                  ourVision: ourVision,
                  saferSpacesPolicy: saferSpacesPolicy,
                  membershipBenefitsInfo: membershipBenefits,
                  contactMethods: contactMethods
                });
              } else {
                res.redirect(process.env.PUBLIC_ADDRESS + "/");
              }
            } else {
              res.render("volunteers/add", {
                title: "Add Volunteer",

                assignedRoles: res.invite.details.roles,
                assignedCoordinators: res.invite.details.assignedCoordinators,
                invite: res.invite,
                coordinators: coordinatorsObj,
                roles: rolesGroupedById,
                skills: skills,
                contactMethods: contactMethods,
                volunteerAgreement: volunteerAgreement,
                ourVision: ourVision,
                saferSpacesPolicy: saferSpacesPolicy,
                membershipBenefitsInfo: membershipBenefits,
                first_name: res.invite.details.first_name,
                last_name: res.invite.details.last_name,
                email: res.invite.details.email
              });
            }
          });
        });
      });
    } else {
      res.redirect("/");
    }
  }
);

router.use("/add-volunteer", require("./add-volunteer"));
router.use("/make-volunteer", require("./make-volunteer"));

module.exports = router;
