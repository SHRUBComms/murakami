// /volunteers/invite/make-volunteer

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Users = Models.Users;
var Members = Models.Members;
var Volunteers = Models.Volunteers;
var VolunteerRoles = Models.VolunteerRoles;
var AccessTokens = Models.AccessTokens;

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/:token",
  Auth.isNotLoggedIn,
  Auth.hasValidToken("add-volunteer"),
  function(req, res) {
    res.redirect(
      process.env.PUBLIC_ADDRESS + "/volunteers/invite/" + res.invite.token
    );
  }
);

router.post(
  "/:token",
  Auth.isNotLoggedIn,
  Auth.hasValidToken("add-volunteer"),
  function(req, res) {
    if (res.invite) {
      Members.getByEmail(res.invite.details.email, function(err, member) {
        member = member[0] || null;
        if (err || !member) {
          res.redirect(
            process.env.PUBLIC_ADDRESS +
              "/volunteers/invite/" +
              res.invite.token
          );
        } else {
          Members.getVolInfoById(member.member_id, function(err, volInfo) {
            if (!volInfo[0]) {
              Users.getCoordinators(
                { permissions: { users: { name: true } } },
                function(err, coordinators, coordinatorsObj, coordinatorsFlat) {
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
                    var volInfo = req.body.volInfo;
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

                    req
                      .checkBody(
                        "volInfo.survey.goals",
                        "Please enter what the volunteer wants to achieve through their work with Shrub"
                      )
                      .notEmpty();

                    req
                      .checkBody(
                        "volInfo.survey.preferredCommMethods",
                        "Please select at least one preferred contact method"
                      )
                      .notEmpty();

                    var errors = req.validationErrors() || [];

                    var days = {
                      mon: true,
                      tue: true,
                      wed: true,
                      thu: true,
                      fri: true,
                      sat: true,
                      sun: true
                    };
                    var periods = { m: true, a: true, e: true };

                    var validTimes = 0;

                    if (volInfo.availability) {
                      Object.keys(volInfo.availability).forEach(function(key) {
                        var validDay = false;
                        var validPeriod = false;

                        if (days[key.substring(0, 3)]) {
                          validDay = true;
                        }

                        if (periods[key.substring(4, 5)]) {
                          validPeriod = true;
                        }

                        if (
                          validDay &&
                          key.substring(3, 4) == "_" &&
                          validPeriod
                        ) {
                          validTimes++;
                        } else {
                          delete volInfo.availability[key];
                        }
                      });
                    }

                    if (validTimes == 0) {
                      let error = {
                        param: "volInfo.availability",
                        msg:
                          "Please tick at least one box in the availability matrix",
                        value: req.body.volInfo.availability
                      };
                      errors.push(error);
                    }

                    volInfo.assignedCoordinators =
                      res.invite.details.assignedCoordinators;
                    volInfo.roles = res.invite.details.roles;

                    if (volInfo.survey.skills) {
                      if (!Array.isArray(volInfo.survey.skills)) {
                        volInfo.survey.skills = [volInfo.survey.skills];
                      }
                      if (
                        !Helpers.allBelongTo(
                          volInfo.survey.skills,
                          Object.keys(skills)
                        )
                      ) {
                        let error = {
                          param: "volInfo.survey.skills",
                          msg: "Please select valid skills",
                          value: req.body.volInfo.survey.skills
                        };

                        errors.push(error);
                      }
                    }

                    if (!Array.isArray(volInfo.survey.preferredCommMethods)) {
                      volInfo.survey.preferredCommMethods = [
                        volInfo.survey.preferredCommMethods
                      ];
                    }

                    if (
                      !Helpers.allBelongTo(
                        volInfo.survey.preferredCommMethods,
                        Object.keys(contactMethods)
                      )
                    ) {
                      let error = {
                        param: "volInfo.survey.preferredCommMethods",
                        msg: "Please select valid contact methods",
                        value: req.body.volInfo.survey.preferredCommMethods
                      };

                      errors.push(error);
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
                        privacyNotice: privacyNotice
                      });
                    } else {
                      Volunteers.addExistingMember(
                        member.member_id,
                        volInfo,
                        function(err) {
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
                              assignedCoordinators:
                                res.invite.details.assignedCoordinators,
                              invite: res.invite,
                              coordinators: coordinatorsObj,
                              roles: rolesGroupedById,

                              volunteerAgreement: volunteerAgreement,
                              ourVision: ourVision,
                              saferSpacesPolicy: saferSpacesPolicy,
                              membershipBenefitsInfo: membershipBenefits,
                              privacyNotice: privacyNotice
                            });
                          } else {
                            if (res.invite) {
                              AccessTokens.markAsUsed(
                                res.invite.token,
                                function() {}
                              );
                            }

                            if (
                              moment(
                                member.current_exp_membership,
                                "L"
                              ).isBefore(moment().add(3, "months"))
                            ) {
                              Members.renew(
                                member.member_id,
                                "3_months",
                                function(err) {
                                  Members.updateFreeStatus(
                                    member.member_id,
                                    1,
                                    function() {
                                      req.flash(
                                        "success_msg",
                                        "Volunteer successfully added! Membership has been renewed"
                                      );
                                      if (res.invite.token) {
                                        res.redirect(
                                          process.env.PUBLIC_ADDRESS +
                                            "/success"
                                        );
                                      } else {
                                        res.redirect(
                                          process.env.PUBLIC_ADDRESS +
                                            "/volunteers/view/" +
                                            res.invite.details.member_id
                                        );
                                      }
                                    }
                                  );
                                }
                              );
                            } else {
                              req.flash(
                                "success_msg",
                                "Volunteer successfully added!"
                              );
                              if (res.invite.token) {
                                res.redirect(
                                  process.env.PUBLIC_ADDRESS + "/success"
                                );
                              } else {
                                res.redirect(
                                  process.env.PUBLIC_ADDRESS +
                                    "/volunteers/view/" +
                                    res.invite.details.member_id
                                );
                              }
                            }
                          }
                        }
                      );
                    }
                  });
                }
              );
            } else {
              req.flash("error_msg", "Member is already a volunteer!");

              res.redirect(
                process.env.PUBLIC_ADDRESS +
                  "/volunteers/view/" +
                  res.invite.details.member_id
              );
            }
          });
        }
      });
    } else {
      res.redirect("/");
    }
  }
);

module.exports = router;
