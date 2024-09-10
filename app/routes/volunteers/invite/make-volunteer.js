// /volunteers/invite/make-volunteer

const router = require("express").Router();
const async = require("async");
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");

const Users = Models.Users;
const Members = Models.Members;
const Volunteers = Models.Volunteers;
const VolunteerRoles = Models.VolunteerRoles;
const AccessTokens = Models.AccessTokens;

const Auth = require(rootDir + "/app/controllers/auth");
const Mail = require(rootDir + "/app/controllers/mail/root");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get("/:token", Auth.isNotLoggedIn, Auth.hasValidToken("add-volunteer"), function (req, res) {
  res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/invite/" + res.invite.token);
});

router.post(
  "/:token",
  Auth.isNotLoggedIn,
  Auth.hasValidToken("add-volunteer"),
  function (req, res) {
    if (res.invite) {
      Members.getByEmail(res.invite.details.email, function (err, member) {
        member = member[0] || null;
        if (err || !member) {
          res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/invite/" + res.invite.token);
        } else {
          Members.getVolInfoById(member.member_id, function (err, volInfo) {
            if (!volInfo[0]) {
              Users.getCoordinators(
                { permissions: { users: { name: true } } },
                function (err, coordinators, coordinatorsObj, coordinatorsFlat) {
                  Volunteers.getSignUpInfo(
                    function (
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
                      const volInfo = req.body.volInfo;
                      if (!volInfo.gdpr) {
                        volInfo.gdpr = {};
                      }

                      req
                        .checkBody(
                          "volInfo.emergencyContactRelation",
                          "Please enter the emergency contact's relation to the member"
                        )
                        .notEmpty();
                      req
                        .checkBody(
                          "volInfo.emergencyContactRelation",
                          "Emergency contact's relation to the member must be <= 25 characters long"
                        )
                        .isLength({ max: 25 });

                      req
                        .checkBody(
                          "volInfo.emergencyContactName",
                          "Please enter the emergency contact's name to the member"
                        )
                        .notEmpty();
                      req
                        .checkBody(
                          "volInfo.emergencyContactName",
                          "Emergency contact's name must be <= 25 characters long"
                        )
                        .isLength({ max: 25 });

                      req
                        .checkBody(
                          "volInfo.emergencyContactPhoneNo",
                          "Please enter the emergency contact's phone number"
                        )
                        .notEmpty();

                      req
                        .checkBody(
                          "volInfo.emergencyContactPhoneNo",
                          "Please enter a shorter phone number (<= 15)"
                        )
                        .isLength({ max: 15 });

                      req
                        .checkBody(
                          "volInfo.medicalDisclosed",
                          "Please make sure the member has disclosed any medical conditions"
                        )
                        .notEmpty();

                      req
                        .checkBody(
                          "volInfo.volunteerAgreementAgreed",
                          "Please agree to the volunteer agreement"
                        )
                        .notEmpty();

                      const errors = req.validationErrors() || [];

                      const days = {
                        mon: true,
                        tue: true,
                        wed: true,
                        thu: true,
                        fri: true,
                        sat: true,
                        sun: true,
                      };
                      const periods = { m: true, a: true, e: true };

                      let validTimes = 0;

                      if (volInfo.availability) {
                        Object.keys(volInfo.availability).forEach(function (key) {
                          let validDay = false;
                          let validPeriod = false;

                          if (days[key.substring(0, 3)]) {
                            validDay = true;
                          }

                          if (periods[key.substring(4, 5)]) {
                            validPeriod = true;
                          }

                          if (validDay && key.substring(3, 4) == "_" && validPeriod) {
                            validTimes++;
                          } else {
                            delete volInfo.availability[key];
                          }
                        });
                      }

                      if (volInfo.availability && validTimes == 0) {
                        const error = {
                          param: "volInfo.availability",
                          msg: "Please tick at least one valid time slot in the availability matrix",
                          value: req.body.volInfo.availability,
                        };
                        errors.push(error);
                      }

                      volInfo.assignedCoordinators = res.invite.details.assignedCoordinators;
                      volInfo.roles = res.invite.details.roles;

                      if (volInfo.survey.skills) {
                        if (!Array.isArray(volInfo.survey.skills)) {
                          volInfo.survey.skills = [volInfo.survey.skills];
                        }
                        if (!Helpers.allBelongTo(volInfo.survey.skills, Object.keys(skills))) {
                          const error = {
                            param: "volInfo.survey.skills",
                            msg: "Please select valid skills",
                            value: req.body.volInfo.survey.skills,
                          };

                          errors.push(error);
                        }
                      }

                      if (volInfo.survey.preferredCommMethods) {
                        if (!Array.isArray(volInfo.survey.preferredCommMethods)) {
                          volInfo.survey.preferredCommMethods = [
                            volInfo.survey.preferredCommMethods,
                          ];
                        }

                        if (
                          !Helpers.allBelongTo(
                            volInfo.survey.preferredCommMethods,
                            Object.keys(contactMethods)
                          )
                        ) {
                          const error = {
                            param: "volInfo.survey.preferredCommMethods",
                            msg: "Please select valid contact methods",
                            value: req.body.volInfo.survey.preferredCommMethods,
                          };

                          errors.push(error);
                        }
                      }

                      if (!Array.isArray(volInfo.roles)) {
                        volInfo.roles = [volInfo.roles];
                      }

                      if (errors[0]) {
                        res.render("members/make-volunteer", {
                          errors: errors,
                          title: "Add Volunteer (Existing Member)",
                          membersActive: true,
                          volInfo: volInfo,
                          member: member,
                          coordinators: coordinators,
                          roles: rolesGroupedByGroup,
                          skills: skills,
                          contactMethods: contactMethods,
                          invite: res.invite,
                          privacyNotice: privacyNotice,
                        });
                      } else {
                        Volunteers.addExistingMember(member.member_id, volInfo, function (err) {
                          if (err) {
                            res.render("members/make-volunteer", {
                              errors: [{ msg: "Something went wrong!" }],
                              title: "Add Volunteer (Existing Member)",
                              membersActive: true,
                              volInfo: volInfo,
                              member: member,

                              skills: skills,
                              contactMethods: contactMethods,

                              assignedRoles: res.invite.details.roles,
                              assignedCoordinators: res.invite.details.assignedCoordinators,
                              invite: res.invite,
                              coordinators: coordinatorsObj,
                              roles: rolesGroupedById,

                              volunteerAgreement: volunteerAgreement,
                              ourVision: ourVision,
                              saferSpacesPolicy: saferSpacesPolicy,
                              membershipBenefitsInfo: membershipBenefits,
                              privacyNotice: privacyNotice,
                            });
                          } else {
                            if (res.invite) {
                              AccessTokens.markAsUsed(res.invite.token, function () {});
                            }

                            if (
                              moment(member.current_exp_membership, "L").isBefore(
                                moment().add(3, "months")
                              )
                            ) {
                              Members.renew(member.member_id, "3_months", function (err) {
                                Members.updateFreeStatus(member.member_id, 1, function () {
                                  req.flash(
                                    "success_msg",
                                    "Volunteer successfully added! Membership has been renewed"
                                  );
                                  if (res.invite.token) {
                                    res.redirect(process.env.PUBLIC_ADDRESS + "/success");
                                  } else {
                                    res.redirect(
                                      process.env.PUBLIC_ADDRESS +
                                        "/volunteers/view/" +
                                        res.invite.details.member_id
                                    );
                                  }
                                });
                              });
                            } else {
                              req.flash("success_msg", "Volunteer successfully added!");
                              if (res.invite.token) {
                                res.redirect(process.env.PUBLIC_ADDRESS + "/success");
                              } else {
                                res.redirect(
                                  process.env.PUBLIC_ADDRESS +
                                    "/volunteers/view/" +
                                    res.invite.details.member_id
                                );
                              }
                            }
                          }
                        });
                      }
                    }
                  );
                }
              );
            } else {
              req.flash("error_msg", "Member is already a volunteer!");

              res.redirect(
                process.env.PUBLIC_ADDRESS + "/volunteers/view/" + res.invite.details.member_id
              );
            }
          });
        }
      });
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/");
    }
  }
);

module.exports = router;
