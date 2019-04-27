// /volunteers/invite/add-volunteer

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
var Mailchimp = require("mailchimp-api-v3");
var md5 = require("md5");
moment.locale("en-gb");

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
        // Membership validation
        var first_name = req.body.first_name.trim();
        var last_name = req.body.last_name.trim();
        var email = req.body.email.trim();
        var phone_no = req.body.phone_no.trim();
        var address = req.body.address.trim();

        var shrubExplained = req.body.shrubExplained;
        var safeSpace = req.body.safeSpace;
        var membershipBenefits = req.body.membershipBenefits;
        var contactConsent = req.body.contactConsent;
        var gdprConsent = req.body.gdprConsent;

        var fseNewsletterConsent = req.body.fseNewsletterConsent;
        var generalNewsletterConsent = req.body.generalNewsletterConsent;

        var till_id = req.query.till_id;

        // Validation
        req.checkBody("first_name", "Please enter a date of birth").notEmpty();

        req.checkBody("first_name", "Please enter a first name").notEmpty();
        req
          .checkBody(
            "first_name",
            "Please enter a shorter first name (<= 20 characters)"
          )
          .isLength({ max: 20 });

        req.checkBody("last_name", "Please enter a last name").notEmpty();
        req
          .checkBody(
            "last_name",
            "Please enter a shorter last name (<= 30 characters)"
          )
          .isLength({ max: 30 });

        req.checkBody("email", "Please enter an email address").notEmpty();
        req
          .checkBody(
            "email",
            "Please enter a shorter email address (<= 89 characters)"
          )
          .isLength({ max: 89 });
        req.checkBody("email", "Please enter a valid email address").isEmail();

        req
          .checkBody(
            "shrubExplained",
            "Please confirm that you have explained SHRUB's vision"
          )
          .notEmpty();
        req
          .checkBody(
            "safeSpace",
            "Please confirm that you have explained our Safer Spaces policy"
          )
          .notEmpty();

        req
          .checkBody(
            "membershipBenefits",
            "Please confirm you have explained membership benefits"
          )
          .notEmpty();

        req
          .checkBody(
            "contactConsent",
            "Please confirm the prospective member has consented to being contacted by email"
          )
          .notEmpty();
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

        var dob = new Date(req.body.dob);
        var today = new Date();

        var over16 = (today - dob) / (1000 * 3600 * 24 * 365) >= 16;

        current_exp_membership = moment(today)
          .add(3, "months")
          .format("YYYY-MM-DD");

        var earliest_membership_date = moment(today).format("YYYY-MM-DD");
        var current_init_membership = earliest_membership_date;

        //Volunteer Validation
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

            if (validDay && key.substring(3, 4) == "_" && validPeriod) {
              validTimes++;
            } else {
              delete volInfo.availability[key];
            }
          });
        }

        if (validTimes == 0) {
          let error = {
            param: "volInfo.availability",
            msg: "Please tick at least one box in the availability matrix",
            value: req.body.volInfo.availability
          };
          errors.push(error);
        }

        if (!over16) {
          var error = {
            param: "dob",
            msg: "Must be over 16 to be a member",
            value: req.body.dob
          };
          errors.push(error);
        }

        volInfo.assignedCoordinators = res.invite.details.assignedCoordinators;
        volInfo.roles = res.invite.details.roles;

        if (!Array.isArray(volInfo.assignedCoordinators)) {
          volInfo.assignedCoordinators = [volInfo.assignedCoordinators];
        }

        if (
          !Helpers.allBelongTo(volInfo.assignedCoordinators, coordinatorsFlat)
        ) {
          let error = {
            param: "volInfo.assignedCoordinators",
            msg: "Please select valid staff coordinator(s)",
            value: req.body.volInfo.assignedCoordinators
          };

          errors.push(error);
        }

        if (volInfo.survey.skills) {
          if (!Array.isArray(volInfo.survey.skills)) {
            volInfo.survey.skills = [volInfo.survey.skills];
          }
          if (
            !Helpers.allBelongTo(volInfo.survey.skills, Object.keys(skills))
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
          res.render("volunteers/add", {
            errors: errors,
            title: "Add Volunteer",
            volunteerActive: true,
            volInfo: volInfo,
            coordinators: coordinatorsObj,
            roles: rolesGroupedById,
            skills: skills,
            contactMethods: contactMethods,
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone_no: phone_no,
            address: address,
            shrubExplained: shrubExplained,
            safeSpace: safeSpace,
            membershipBenefits: membershipBenefits,
            contactConsent: contactConsent,
            gdprConsent: gdprConsent,
            dob: dob,
            invite: res.invite,
            volunteerAgreement: volunteerAgreement,
            ourVision: ourVision,
            saferSpacesPolicy: saferSpacesPolicy,
            membershipBenefitsInfo: membershipBenefits,
            privacyNotice: privacyNotice
          });
        } else {
          var newMember = {
            member_id: null,
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone_no: phone_no,
            address: address,
            free: 1,
            earliest_membership_date: earliest_membership_date,
            current_init_membership: current_init_membership,
            current_exp_membership: current_exp_membership
          };

          Members.add(newMember, function(err, member_id) {
            Volunteers.addExistingMember(member_id, volInfo, function(err) {
              if (err) {
                res.render("volunteers/add", {
                  errors: [{ msg: "Something went wrong!" }],
                  title: "Add Volunteer",
                  volunteerActive: true,
                  volInfo: volInfo,
                  coordinators: coordinatorsObj,
                  roles: rolesGroupedById,
                  skills: skills,
                  contactMethods: contactMethods,
                  first_name: first_name,
                  last_name: last_name,
                  email: email,
                  phone_no: phone_no,
                  address: address,
                  shrubExplained: shrubExplained,
                  safeSpace: safeSpace,
                  membershipBenefits: membershipBenefits,
                  contactConsent: contactConsent,
                  gdprConsent: gdprConsent,
                  dob: dob,
                  invite: res.invite,
                  volunteerAgreement: volunteerAgreement,
                  ourVision: ourVision,
                  saferSpacesPolicy: saferSpacesPolicy,
                  membershipBenefitsInfo: membershipBenefits,
                  privacyNotice: privacyNotice
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
                      process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID +
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

                Mail.sendAutomated("welcome_volunteer", member_id, function(
                  err
                ) {});
                if (res.invite) {
                  AccessTokens.markAsUsed(res.invite.token, function() {});
                  res.redirect(process.env.PUBLIC_ADDRESS + "/success");
                } else {
                  req.flash("success_msg", "Volunteer successfully added!");
                  res.redirect(
                    process.env.PUBLIC_ADDRESS + "/volunteers/view/" + member_id
                  );
                }
              }
            });
          });
        }
      });
    });
  }
);

module.exports = router;
