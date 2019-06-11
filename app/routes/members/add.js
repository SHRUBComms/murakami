// /members/add

var router = require("express").Router();
var Mailchimp = require("mailchimp-api-v3");
var md5 = require("md5");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Members = Models.Members;
var WorkingGroups = Models.WorkingGroups;
var AccessTokens = Models.AccessTokens;
var Tills = Models.Tills;
var Transactions = Models.Transactions;

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("members", "add"), function(
  req,
  res
) {
  var tillMode;
  var till_id = req.query.till_id || null;
  if (till_id) {
    tillMode = true;
  }

  Tills.getById(till_id, function(err, till) {
    Members.getSignUpInfo(function(
      ourVision,
      saferSpacesPolicy,
      membershipBenefits,
      privacyNotice
    ) {
      res.render("members/add", {
        tillMode: res.locals.tillMode || tillMode,
        title: "Add Member",
        membersActive: true,
        addMemberActive: true,

        ourVision: ourVision,
        saferSpacesPolicy: saferSpacesPolicy,
        membershipBenefitsInfo: membershipBenefits,
        privacyNotice: privacyNotice,

        murakamiMsg: req.query.murakamiMsg || null,
        murakamiStatus: req.query.murakamiStatus || null,

        till_id: till_id,

        till: till
      });
    });
  });
});

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("members", "add"),
  function(req, res) {
    Tills.getById(req.query.till_id, function(err, till) {
      if ((req.user.class != "admin" && till) || req.user.class == "admin") {
        Members.getSignUpInfo(function(
          ourVision,
          saferSpacesPolicy,
          membershipBenefits,
          privacyNotice
        ) {
          var first_name = req.body.first_name.trim();
          var last_name = req.body.last_name.trim();
          var email = req.body.email.trim();
          var phone_no = req.body.phone_no.trim();
          var address = req.body.address.trim();
          var membership_type = req.body.membership_type || "unpaid";

          var shrubExplained = req.body.shrubExplained;
          var safeSpace = req.body.safeSpace;
          var membershipBenefits = req.body.membershipBenefits;
          var contactConsent = req.body.contactConsent;
          var gdprConsent = req.body.gdprConsent;

          var generalNewsletterConsent = req.body.generalNewsletterConsent;

          var till_id = req.query.till_id;

          // Validation
          req.checkBody("dob", "Please enter a date of birth").notEmpty();

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
          req
            .checkBody("email", "Please enter a valid email address")
            .isEmail();

          req.checkBody("address", "Please enter an address").notEmpty();

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

          var earliest_membership_date = today;
          var current_init_membership = today;
          var current_exp_membership = today;

          var errors = req.validationErrors();

          if (req.user.class == "admin") {
            if (["lifetime", "staff", "trustee"].includes(membership_type)) {
              current_exp_membership = moment("9999-01-01").toDate();
            } else {
              if (!errors) {
                errors = [];
              }
              errors.push({
                param: "membership_type",
                msg: "Please select a valid membership type.",
                value: req.body.membership_type
              });
            }
          } else {
            membership_type = "unpaid";
          }

          if (!errors && !over16) {
            if (!errors) {
              errors = [];
            }
            errors.push({
              param: "dob",
              msg: "Must be over 16 to be a member",
              value: req.body.dob
            });
          }

          if (errors[0]) {
            res.render("members/add", {
              errors: errors,
              membersActive: true,
              title: "Add Member",
              first_name: first_name,
              last_name: last_name,
              email: email,
              phone_no: phone_no,
              address: address,
              shrubExplained: shrubExplained,
              safeSpace: safeSpace,
              membershipBenefits: membershipBenefits,
              contactConsent: contactConsent,
              privacyNotice: privacyNotice,
              gdprConsent: gdprConsent,
              dob: dob,
              till: {
                till_id: till_id
              }
            });
          } else {
            var newMember = {
              member_id: null,
              first_name: first_name,
              last_name: last_name,
              email: email,
              phone_no: phone_no,
              address: address,
              free: 0,
              membership_type: membership_type,
              earliest_membership_date: earliest_membership_date,
              current_init_membership: current_init_membership,
              current_exp_membership: current_exp_membership
            };

            Members.add(newMember, function(err, member_id) {
              if (err) {
                res.render("members/add", {
                  errors: [
                    {
                      msg: "Something went wrong, please try again!"
                    }
                  ],
                  membersActive: true,
                  title: "Add Member",
                  first_name: first_name,
                  last_name: last_name,
                  email: email,
                  phone_no: phone_no,
                  address: address,
                  shrubExplained: shrubExplained,
                  safeSpace: safeSpace,
                  membershipBenefits: membershipBenefits,
                  contactConsent: contactConsent,
                  privacyNotice: privacyNotice,
                  gdprConsent: gdprConsent,
                  dob: dob,
                  till: {
                    till_id: till_id
                  }
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

                Mail.sendAutomated("hello", member_id, function(err) {});

                if (!till) {
                  req.flash("success_msg", "New member added!");

                  res.redirect(
                    process.env.PUBLIC_ADDRESS + "/members/view/" + member_id
                  );
                } else {
                  res.redirect(
                    process.env.PUBLIC_ADDRESS +
                      "/till/transaction/" +
                      req.query.till_id +
                      "?member_id=" +
                      member_id +
                      "&murakamiMsg=" +
                      encodeURIComponent(
                        "Member successfully added - please select and pay for a membership to complete registration"
                      ) +
                      "&murakamiStatus=ok"
                  );
                }
              }
            });
          }
        });
      }
    });
  }
);

module.exports = router;
