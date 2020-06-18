// volunteers/invite

var router = require("express").Router();
var async = require("async");
var validator = require("email-validator");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Users = Models.Users;
var Members = Models.Members;
var Volunteers = Models.Volunteers;
var VolunteerRoles = Models.VolunteerRoles;
var AccessTokens = Models.AccessTokens;
var Settings = Models.Settings;
var FoodCollectionsKeys = Models.FoodCollectionsKeys;
var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail/root");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "invite"),
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

    Settings.getById("defaultFoodCollectorRole", function(
      err,
      defaultFoodCollectorRoleId
    ) {
      VolunteerRoles.getRoleById(
        defaultFoodCollectorRoleId.data.role_id,
        function(err, defaultFoodCollectorRole) {
          Users.getCoordinators(req.user, function(err, coordinators) {
            res.render("volunteers/invite", {
              title: "Invite Volunteer",
              volunteersActive: true,
              errors: errors,
              coordinators: coordinators,
              defaultFoodCollectorRole: defaultFoodCollectorRole
            });
          });
        }
      );
    });
  }
);

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "invite"),
  function(req, res) {
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var roles = [];
    var organisations = req.body.organisations;
    var assignedCoordinators = [req.user.id];

    if (first_name && last_name) {
      if (email) {
        if (validator.validate(email)) {
          Settings.getById("defaultFoodCollectorRole", function(
            err,
            defaultFoodCollectorRoleId
          ) {
            roles.push(defaultFoodCollectorRoleId.data.role_id);
            FoodCollectionsOrganisations.getAll(function(
              err,
              allOrganisations
            ) {
              if (Array.isArray(organisations)) {
                if (
                  !Helpers.allBelongTo(
                    organisations,
                    Object.keys(allOrganisations)
                  )
                ) {
                  organisations = [];
                }
              } else {
                organisations = [];
              }
              Members.getByEmail(email, function(err, member) {
                member = member[0] || null;
                if (!member || (member && !member.volunteer_id)) {
                  var details = {
                    action: "add-volunteer",
                    user_id: req.user.id
                  };

                  details.roles = roles;
                  details.assignedCoordinators = assignedCoordinators;
                  details.foodCollectionOrganisations = organisations;

                  details.email = email;
                  details.first_name = first_name;
                  details.last_name = last_name;

                  var expirationTimestamp = moment()
                    .add(7, "days")
                    .toDate();

                  AccessTokens.createInvite(
                    expirationTimestamp,
                    details,
                    function(err, token) {
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
                          "Volunteer Registration",
                          "<p>Hey " +
                            first_name +
                            ",</p>" +
                            "<p>You've been invited to register as a volunteer with SHRUB by " +
                            req.user.first_name +
                            " " +
                            req.user.last_name +
                            "!</p>" +
                            "<p>Please follow the link below to register. It will expire at <b>" +
                            moment(expirationTimestamp).format("L hh:mm A") +
                            "</b>.</p>" +
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
                                "Invite sent successfully! Expires at <b>" +
                                  moment(expirationTimestamp).format(
                                    "L hh:mm A"
                                  ) +
                                  "</b>."
                              );
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
                  Volunteers.getVolunteerById(
                    member.volunteer_id,
                    {
                      permissions: {
                        volunteers: {
                          roles: true,
                          assignedCoordinators: true
                        },
                        members: {
                          name: true,
                          contactDetails: true
                        }
                      }
                    },
                    function(err, volunteer) {
                      if (
                        !volunteer.roles.includes(
                          defaultFoodCollectorRoleId.data.role_id
                        )
                      ) {
                        volunteer.roles.push(
                          defaultFoodCollectorRoleId.data.role_id
                        );
                      }

                      if (
                        !volunteer.assignedCoordinators.includes(req.user.id)
                      ) {
                        volunteer.assignedCoordinators.push(req.user.id);
                      }

                      Volunteers.updateRoles(
                        volunteer.member_id,
                        volunteer.roles,
                        function(err) {
                          if (!err) {
                            Volunteers.updateAssignedCoordinators(
                              volunteer.member_id,
                              volunteer.assignedCoordinators,
                              function(err) {
                                if (!err) {
                                  FoodCollectionsKeys.createKey(
                                    {
                                      member_id: volunteer.member_id,
                                      organisations: organisations
                                    },
                                    function(err, foodCollectionKey) {
                                      var link =
                                        process.env.PUBLIC_ADDRESS +
                                        "/food-collections/log/" +
                                        foodCollectionKey;
                                      Mail.sendGeneral(
                                        volunteer.first_name +
                                          " " +
                                          volunteer.last_name +
                                          "<" +
                                          volunteer.email +
                                          ">",
                                        "Logging Food Collections",
                                        "<p>Hey " +
                                          volunteer.first_name +
                                          ",</p>" +
                                          "<p>Please use the link below to log your food collections!</p>" +
                                          "<a href='" +
                                          link +
                                          "'>" +
                                          link +
                                          "</a>" +
                                          "<p><small>Please note that this is an automated email.</small></p>",
                                        function(err) {}
                                      );

                                      req.flash(
                                        "success_msg",
                                        "Volunteer already exists!<br/><ul><li>You have been assigned as their co-coordinator</li><li>The food collector role has been added to their profile</li><li>They have been emailed their unique food collection link</li></ul>"
                                      );
                                      res.redirect(
                                        process.env.PUBLIC_ADDRESS +
                                          "/volunteers/view/" +
                                          volunteer.member_id
                                      );
                                    }
                                  );
                                } else {
                                  req.flash(
                                    "error_msg",
                                    "Volunteer already exists, but something went wrong adding you as their coordinator."
                                  );
                                  res.redirect(
                                    process.env.PUBLIC_ADDRESS +
                                      "/volunteers/invite"
                                  );
                                }
                              }
                            );
                          } else {
                            req.flash(
                              "error_msg",
                              "Volunteer already exists, but something went wrong adding the food collector role."
                            );
                            res.redirect(
                              process.env.PUBLIC_ADDRESS + "/volunteers/invite"
                            );
                          }
                        }
                      );
                    }
                  );
                }
              });
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
  }
);

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
          membershipBenefits,
          privacyNotice
        ) {
          Members.getByEmail(res.invite.details.email, function(err, member) {
            member = member[0] || null;

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
                  contactMethods: contactMethods,
                  privacyNotice: privacyNotice
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
                email: res.invite.details.email,
                privacyNotice: privacyNotice
              });
            }
          });
        });
      });
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/");
    }
  }
);

router.use("/add-volunteer", require("./add-volunteer"));
router.use("/make-volunteer", require("./make-volunteer"));

module.exports = router;
