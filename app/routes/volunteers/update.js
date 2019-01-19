// volunteers/update

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var Users = require(rootDir + "/app/models/users");
var Volunteers = require(rootDir + "/app/models/volunteers");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    Members.getById(req.params.member_id, req.user, function(err, member) {
      if (err || !member) {
        req.flash("error_msg", "Member not found!");
        res.redirect(process.env.PUBLIC_ADDRESS + "/members");
      } else {
        Volunteers.getVolunteerById(req.params.member_id, function(
          err,
          volInfo
        ) {
          if (volInfo) {
            if (
              Helpers.hasOneInCommon(volInfo.assignedCoordinators, [
                req.user.id
              ]) ||
              req.user.class == "admin"
            ) {
              Users.getCoordinators(req.user, function(err, coordinators) {
                Volunteers.getSignUpInfo(function(
                  skills,
                  contactMethods,
                  roles,
                  rolesGroupedByGroup,
                  rolesGroupedById
                ) {
                  res.render("volunteers/update", {
                    title: "Update Volunteer",
                    volunteersActive: true,
                    member: member,
                    first_name: member.first_name,
                    last_name: member.last_name,
                    email: member.email,
                    phone_no: member.phone_no,
                    address: member.address,
                    volInfo: volInfo,
                    roleChanged: false,
                    coordinators: coordinators,
                    roles: rolesGroupedByGroup,
                    skills: skills,
                    contactMethods: contactMethods
                  });
                });
              });
            } else {
              req.flash(
                "error_msg",
                "You don't have permission to update this volunteer!"
              );
              res.redirect(
                process.env.PUBLIC_ADDRESS +
                  "/volunteers/view/" +
                  member.member_id
              );
            }
          }
        });
      }
    });
  }
);

router.post(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    Members.getById(req.params.member_id, req.user, function(err, member) {
      if (err || !member) {
        req.flash("error_msg", "Member not found!");
        res.redirect(process.env.PUBLIC_ADDRESS + "/members");
      } else {
        Volunteers.getVolunteerById(req.params.member_id, function(
          err,
          oldVolInfo
        ) {
          if (oldVolInfo) {
            if (
              Helpers.hasOneInCommon(oldVolInfo.assignedCoordinators, [
                req.user.id
              ]) ||
              req.user.class == "admin"
            ) {
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
                  rolesGroupedById
                ) {
                  // Membership validation
                  var first_name = req.body.first_name.trim();
                  var last_name = req.body.last_name.trim();
                  var email = req.body.email.trim();
                  var phone_no = req.body.phone_no.trim();
                  var address = req.body.address.trim();

                  var gdprConsent = req.body.gdprConsent;

                  var fseNewsletterConsent = req.body.fseNewsletterConsent;
                  var generalNewsletterConsent =
                    req.body.generalNewsletterConsent;

                  // Validation
                  req
                    .checkBody("first_name", "Please enter a date of birth")
                    .notEmpty();

                  req
                    .checkBody("first_name", "Please enter a first name")
                    .notEmpty();
                  req
                    .checkBody(
                      "first_name",
                      "Please enter a shorter first name (<= 20 characters)"
                    )
                    .isLength({ max: 20 });

                  req
                    .checkBody("last_name", "Please enter a last name")
                    .notEmpty();
                  req
                    .checkBody(
                      "last_name",
                      "Please enter a shorter last name (<= 30 characters)"
                    )
                    .isLength({ max: 30 });

                  req
                    .checkBody("email", "Please enter an email address")
                    .notEmpty();
                  req
                    .checkBody(
                      "email",
                      "Please enter a shorter email address (<= 89 characters)"
                    )
                    .isLength({ max: 89 });
                  req
                    .checkBody("email", "Please enter a valid email address")
                    .isEmail();

                  req
                    .checkBody(
                      "gdprConsent",
                      "Please confirm the prospective member has agreed to our privacy policy"
                    )
                    .notEmpty();

                  if (phone_no) {
                    req
                      .checkBody(
                        "phone_no",
                        "Please enter a shorter phone number (<= 30)"
                      )
                      .isLength({ max: 30 });
                  }

                  //Volunteer Validation
                  var volInfo = req.body.volInfo;

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
                      "volInfo.roles",
                      "Please select at least one role"
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

                  var rolesChanged = false;
                  if (volInfo.roles != oldVolInfo.roles) {
                    rolesChanged = true;
                    if (volInfo.volunteerAgreementAgreed != "on") {
                      let error = {
                        param: "volInfo.volunteerAgreementAgreed",
                        msg: "Please agree to the volunteer agreement",
                        value: req.body.volInfo.volunteerAgreementAgreed
                      };
                      errors.push(error);
                    }
                  }

                  if (!Array.isArray(volInfo.assignedCoordinators)) {
                    volInfo.assignedCoordinators = [
                      volInfo.assignedCoordinators
                    ];
                  }

                  if (
                    !Helpers.allBelongTo(
                      volInfo.assignedCoordinators,
                      coordinatorsFlat
                    )
                  ) {
                    let error = {
                      param: "volInfo.assignedCoordinators",
                      msg: "Please select a valid staff coordinators",
                      value: req.body.volInfo.assignedCoordinators
                    };

                    errors.push(error);
                  }

                  if (volInfo.survey.skills) {
                    if (!Array.isArray(volInfo.survey.skills)) {
                      volInfo.survey.skills = [volInfo.survey.skills];
                    }
                    if (!Helpers.allBelongTo(volInfo.survey.skills, skills)) {
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
                      contactMethods
                    )
                  ) {
                    let error = {
                      param: "volInfo.survey.preferredCommMethods",
                      msg: "Please select valid contact methods",
                      value: req.body.volInfo.survey.preferredCommMethods
                    };

                    errors.push(error);
                  }

                  var rolesValid = true;
                  if (!Array.isArray(volInfo.roles)) {
                    volInfo.roles = [volInfo.roles];
                  }
                  async.each(
                    volInfo.roles,
                    function(role, callback) {
                      if (!rolesGroupedById[role]) {
                        rolesValid = false;
                      }
                      callback();
                    },
                    function() {
                      if (rolesValid == false) {
                        let error = {
                          param: "volInfo.roles",
                          msg: "Please select valid roles",
                          value: req.body.volInfo.roles
                        };

                        errors.push(error);
                      }
                    }
                  );

                  if (errors[0]) {
                    res.render("volunteers/update", {
                      errors: errors,
                      title: "Update Volunteer",
                      volunteersActive: true,
                      volInfo: volInfo,
                      rolesChanged: rolesChanged,
                      member: member,
                      coordinators: coordinators,
                      roles: rolesGroupedByGroup,
                      skills: skills,
                      contactMethods: contactMethods,
                      first_name: first_name,
                      last_name: last_name,
                      email: email,
                      phone_no: phone_no,
                      address: address,
                      gdprConsent: gdprConsent
                    });
                  } else {
                    var updatedMember = {
                      member_id: member.member_id,
                      first_name: first_name,
                      last_name: last_name,
                      email: email,
                      phone_no: phone_no,
                      address: address
                    };

                    Members.updateBasic(updatedMember, function(
                      err,
                      member_id
                    ) {
                      Volunteers.updateVolunteer(
                        member.member_id,
                        volInfo,
                        function(err) {
                          if (err) {
                            res.render("volunteers/update", {
                              errors: [{ msg: "Something went wrong!" }],
                              title: "Update Volunteer",
                              volunteersActive: true,
                              volInfo: volInfo,
                              rolesChanged: rolesChanged,
                              member: member,
                              coordinators: coordinators,
                              roles: rolesGroupedByGroup,
                              skills: skills,
                              contactMethods: contactMethods,
                              first_name: first_name,
                              last_name: last_name,
                              email: email,
                              phone_no: phone_no,
                              address: address,
                              gdprConsent: gdprConsent
                            });
                          } else {
                            var subscribeBody = {
                              email_address: email,
                              status: "subscribed",
                              merge_fields: {
                                FNAME: first_name,
                                LNAME: last_name
                              }
                            };
                            if (generalNewsletterConsent == "on") {
                              var shrubMailchimp = new Mailchimp(
                                process.env.SHRUB_MAILCHIMP_SECRET_API_KEY
                              );
                              shrubMailchimp.put(
                                "/lists/" +
                                  process.env
                                    .SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID +
                                  "/members/" +
                                  md5(email),
                                subscribeBody
                              );
                            }

                            if (fseNewsletterConsent == "on") {
                              var fseMailchimp = new Mailchimp(
                                process.env.FSE_MAILCHIMP_SECRET_API_KEY
                              );
                              fseMailchimp.put(
                                "/lists/" +
                                  process.env.FSE_MAILCHIMP_NEWSLETTER_LIST_ID +
                                  "/members/" +
                                  md5(email),
                                subscribeBody
                              );
                            }
                            console.log("Success!");
                            req.flash(
                              "success_msg",
                              "Volunteer successfully updated!"
                            );
                            res.redirect(
                              process.env.PUBLIC_ADDRESS +
                                "/volunteers/view/" +
                                member.member_id
                            );
                          }
                        }
                      );
                    });
                  }
                });
              });
            } else {
              req.flash(
                "error_msg",
                "You don't have permission to update this volunteer!"
              );
              res.redirect(
                process.env.PUBLIC_ADDRESS +
                  "/volunteers/view/" +
                  member.member_id
              );
            }
          } else {
            req.flash("error_msg", "This member is not a volunteer!");
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/members/view/" +
                req.params.member_id
            );
          }
        });
      }
    });
  }
);

module.exports = router;
