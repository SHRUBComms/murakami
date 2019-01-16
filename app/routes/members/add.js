// /members/add

var router = require("express").Router();
var Mailchimp = require("mailchimp-api-v3");
var md5 = require("md5");
var moment = require("moment"); moment.locale("en-gb");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");
var AccessTokens = require(rootDir + "/app/models/access-tokens");
var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail");

router.get("/", Auth.isLoggedIn, function(req, res) {
  var tillMode;
  var till_id = req.query.till_id || null;
  if (till_id) {
    tillMode = true;
  }
  res.render("members/add", {
    tillMode: res.locals.tillMode || tillMode,
    title: "Add Member",
    addMemberActive: true,
    membership_length: req.query.membership_length,
    till: {
      till_id: till_id
    }
  });
});

router.post("/", function(req, res) {
  var first_name = req.body.first_name.trim();
  var last_name = req.body.last_name.trim();
  var email = req.body.email.trim();
  var phone_no = req.body.phone_no.trim();
  var address = req.body.address.trim();
  var membership_length = req.body.membership_length.trim();

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
      .checkBody("phone_no", "Please enter a shorter phone number (<= 30)")
      .isLength({ max: 30 });
  }

  var dob = new Date(req.body.dob);
  var today = new Date();

  var over16 = (today - dob) / (1000 * 3600 * 24 * 365) >= 16;

  // Parse membership info
  if (membership_length == "year") {
    current_exp_membership = moment(today)
      .add(12, "months")
      .format("YYYY-MM-DD");
  } else if (membership_length == "half_year") {
    current_exp_membership = moment(today)
      .add(6, "months")
      .format("YYYY-MM-DD");
  } else if (membership_length == "3_months") {
    current_exp_membership = moment(today)
      .add(3, "months")
      .format("YYYY-MM-DD");
  } else if (membership_length == "eternal" && req.user.class == "admin") {
    current_exp_membership = moment("9999-01-01").format("YYYY-MM-DD");
  } else {
    if (!errors) {
      var error = {
        param: "membership_length",
        msg: "Please select a valid membership length.",
        value: req.body.membership_length
      };
      errors = [];
      errors.push(error);
    }
  }

  var earliest_membership_date = moment(today).format("YYYY-MM-DD");
  var current_init_membership = earliest_membership_date;

  // Parse request's body
  var errors = req.validationErrors();

  if (!errors && !over16) {
    var error = {
      param: "dob",
      msg: "Must be over 16 to be a member",
      value: req.body.dob
    };
    errors = [];
    errors.push(error);
  }

  if (errors) {
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
      earliest_membership_date: earliest_membership_date,
      current_init_membership: current_init_membership,
      current_exp_membership: current_exp_membership
    };

    Members.add(newMember, function(err, member_id) {

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

      if (membership_length == "year") {
        var transaction = {
          member_id: member_id,
          till_id: till_id || null,
          user_id: "automatic",
          date: today,
          summary: {
            totals: {
              tokens: 5
            },
            bill: [
              {
                tokens: "5",
                item_id: "membership"
              }
            ],
            comment: "",
            paymentMethod: null
          }
        };
        transaction.summary = JSON.stringify(transaction.summary);
        Tills.addTransaction(transaction, function(err) {
          Members.updateBalance(member_id, 5, function(err) {});
        });
      }

      Mail.sendAutomated("hello", member_id, function(err) {});

      req.flash("success_msg", "New member added!");
      res.redirect(process.env.PUBLIC_ADDRESS + "/members/view/" + member_id);
    });
  }
});

module.exports = router;
