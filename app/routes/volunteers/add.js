// volunteers/add

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var Users = require(rootDir + "/app/models/users");
var Volunteers = require(rootDir + "/app/models/volunteers");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    Users.getCoordinators(req.user, function(err, coordinators) {
      Volunteers.getAllRoles(function(err, roles){

        var formattedRoles = [];

        async.each(roles, function(role, callback){
          if(!role.group_id) role.group_id = "na";
          if (!formattedRoles[role.group_id]){
            formattedRoles[role.group_id] = [role]
          } else {
            formattedRoles[role.group_id].push(role);
          }
          callback();
        }, function(){

          res.render("volunteers/add", {
            title: "Add Volunteer",
            volunteersActive: true,
            coordinators: coordinators,
            roles: formattedRoles,
            skills: [
              "Administration/office work",
              "Events",
              "Adults",
              "Advice/Information giving",
              "Families",
              "Finance/Accounting",
              "Advocacy/Human Rights",
              "Health and social care",
              "Animals	Heritage",
              "Art and culture: music, drama, crafts, galleries and museums",
              "Homeless and housing",
              "Befriending/Mentoring",
              "Kitchen/Catering",
              "Campaigning/Lobbying	",
              "Languages/translating",
              "Care/Support work",
              "LGBT+",
              "Charity shops/Retail	",
              "Management/Business",
              "Children",
              "Mental health",
              "Community",
              "Library/Information Management",
              "Computing/Technical",
              "Marketing/PR/Media",
              "Counselling",
              "Politics",
              "Disability",
              "Practical/DIY",
              "Education",
              "Research and policy work",
              "Domestic violence",
              "Sport and recreation",
              "Drugs and addiction",
              "Students'Association",
              "Elderly",
              "Wheelchair accessible",
              "Driving/escorting",
              "Trustee and committee roles",
              "Environment/conservation/outdoors",
              "Tutoring",
              "Equality and Diversity",
              "Youth work"
            ]
          });

        })

      })
    });
  }
);

router.post("/", function(req, res){
  Users.getCoordinators(req.user, function(err, coordinators) {
    Volunteers.getAllRoles(function(err, roles){
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

      var volInfo = req.body.volInfo;

      var assignedCoordinator = req.body.assignedCoordinator;

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

        req
          .checkBody(
            "assignedCoordinator",
            "Please assign a staff co-ordinator"
          )
          .notEmpty();

      if (phone_no) {
        req
          .checkBody("phone_no", "Please enter a shorter phone number (<= 30)")
          .isLength({ max: 30 });
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
          "volInfo.hoursPerWeek",
          "Please enter the agreed hours to be volunteer per week"
        )
        .notEmpty();

      req
        .checkBody(
          "medicalDisclosed",
          "Please make sure the member has disclosed any medical conditions"
        )
        .notEmpty();
      req
        .checkBody(
          "volunteerAgreement",
          "Please make sure the member has agrred to the volunteer agreement"
        )
        .notEmpty();

      volInfo.contactConsent = {phone:0, email:0}
      if(req.body.canShareEmail == "on"){
        volInfo.contactConsent.email = 1;
      }

      if(req.body.canSharePhone == "on"){
        volInfo.contactConsent.phone = 1;
      }

      var dob = new Date(req.body.dob);
      var today = new Date();

      var over16 = (today - dob) / (1000 * 3600 * 24 * 365) >= 16;

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

      var days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
      var periods = ["m", "a", "e"];

      var validTimes = 0;

      if (volInfo.availability) {
        Object.keys(volInfo.availability).forEach(function(key) {
          var validDay = false;
          var validPeriod = false;
          for (let i = 0; i < days.length; i++) {
            if (key.substring(0, 3) == days[i]) {
              validDay = true;
            }
          }

          for (let i = 0; i < periods.length; i++) {
            if (
              key.substring(4, 5) == periods[i]
            ) {
              validPeriod = true;
            }
          }
          if (validDay && key.substring(3, 4) == "_" && validPeriod) {
            validTimes++;
          } else {
            delete volInfo.availability[key];
          }
        });
      }

      if (!errors && validTimes == 0) {
        let error = {
          param: "availability",
          msg: "Please tick at least one box in the availability matrix",
          value: req.body.volInfo.availability
        };
        errors = [];
        errors.push(error);
      }

      if(!errors && !Helpers.hasOneInCommon(coordinators, assignedCoordinator){
        let error = {
          param: "assignedCoordinator",
          msg: "Please assign a valid staff coordinator",
          value: req.body.staffCoordinator
        };
        errors = [];
        errors.push(error);
      }

      if (errors) {
        res.render("volunteers/add", {
          errors: errors,
          volunteersActive: true,
          title: "Add Volunteer",
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
          dob: dob
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
          Volunteers.addVolunteer(volInfo, function(err){

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

            Mail.sendAutomated("hello_volunteer", member_id, function(err) {});

            req.flash("success_msg", "New volunteer added!");
            res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/view/" + member_id);

          })
        });
      }
    });
  });
});

module.exports = router;
