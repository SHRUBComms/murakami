// /contact-preferences

var router = require("express").Router();
var Mailchimp = require("mailchimp-api-v3");
var md5 = require("md5");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

router.get("/:member_id", function(req, res) {
  Members.getById(req.params.member_id, { class: "admin" }, function(
    err,
    member
  ) {
    if (!err && member) {
      member.contactPreferences.newsletters = {
        shrub: null,
        fse: null
      };

      var shrubMailchimp = new Mailchimp(
        process.env.SHRUB_MAILCHIMP_SECRET_API_KEY
      );

      var fseMailchimp = new Mailchimp(
        process.env.FSE_MAILCHIMP_SECRET_API_KEY
      );

      shrubMailchimp.get(
        "/lists/" +
          process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID +
          "/members/" +
          md5(member.email),
        function(err, response) {
          try {
            if (response.status == "subscribed") {
              member.contactPreferences.newsletters.shrub = true;
            }
          } catch (err) {}

          fseMailchimp.get(
            {
              path:
                "/lists/" +
                process.env.FSE_MAILCHIMP_NEWSLETTER_LIST_ID +
                "/members/" +
                md5(member.email)
            },
            function(err, response) {
              try {
                if (response.status == "subscribed") {
                  member.contactPreferences.newsletters.fse = true;
                }
              } catch (err) {}

              console.log(member.contactPreferences);
              res.render("contact-preferences.hbs", {
                title: "Contact Preferences",
                member: member
              });
            }
          );
        }
      );
    } else {
      res.render("error", {
        title: "Page Not Found",
        notFound: true
      });
    }
  });
});

router.post("/:member_id", function(req, res) {
  Members.getById(req.params.member_id, { class: "admin" }, function(
    err,
    member
  ) {
    if (member && !err) {
      var contactPreferences = {
        volunteeringOpportunities:
          member.contactPreferences.volunteeringOpportunities,
        donations: member.contactPreferences.donations,
        newsletters: {}
      };

      var subscribeBody = {
        email_address: member.email,
        status: "subscribed",
        merge_fields: {
          FNAME: member.first_name,
          LNAME: member.last_name
        }
      };

      // Subscribe to mailchimp
      try {
        if (req.body.newsletters.shrub.subscribe) {
          contactPreferences.newsletters.shrub = true;
          var shrubMailchimp = new Mailchimp(
            process.env.SHRUB_MAILCHIMP_SECRET_API_KEY
          );
          shrubMailchimp.put(
            "/lists/" +
              process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID +
              "/members/" +
              md5(member.email),
            subscribeBody
          );
        }
      } catch (err) {}

      try {
        if (req.body.newsletters.fse.subscribe) {
          contactPreferences.newsletters.shrub = true;
          var fseMailchimp = new Mailchimp(
            process.env.FSE_MAILCHIMP_SECRET_API_KEY
          );
          fseMailchimp.put(
            "/lists/" +
              process.env.FSE_MAILCHIMP_NEWSLETTER_LIST_ID +
              "/members/" +
              md5(member.email),
            subscribeBody
          );
        }
      } catch (err) {}

      // Unsubscribe from mailchimp
      try {
        if (req.body.newsletters.shrub.unsubscribe) {
          contactPreferences.newsletters.shrub = null;
          var shrubMailchimp = new Mailchimp(
            process.env.SHRUB_MAILCHIMP_SECRET_API_KEY
          );
          shrubMailchimp.delete(
            "/lists/" +
              process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID +
              "/members/" +
              md5(member.email),
            subscribeBody
          );
        }
      } catch (err) {}

      try {
        if (req.body.newsletters.fse.unsubscribe) {
          contactPreferences.newsletters.fse = null;
          var fseMailchimp = new Mailchimp(
            process.env.FSE_MAILCHIMP_SECRET_API_KEY
          );
          fseMailchimp.delete(
            "/lists/" +
              process.env.FSE_MAILCHIMP_NEWSLETTER_LIST_ID +
              "/members/" +
              md5(member.email),
            subscribeBody
          );
        }
      } catch (err) {}

      try {
        if (req.body.volunteeringOpportunities.subscribe) {
          contactPreferences.volunteeringOpportunities = true;
        }
      } catch (err) {}

      try {
        if (req.body.volunteeringOpportunities.unsubscribe) {
          contactPreferences.volunteeringOpportunities = null;
        }
      } catch (err) {}

      try {
        if (req.body.donations.subscribe) {
          contactPreferences.donations = true;
        }
      } catch (err) {}

      try {
        if (req.body.donations.unsubscribe) {
          contactPreferences.donations = null;
        }
      } catch (err) {}

      Members.updateContactPreferences(
        req.params.member_id,
        contactPreferences,
        function(err) {
          if (!err) {
            res.render("contact-preferences", {
              success_msg: "Contact preferences successfully updated!",
              title: "Contact Preferences",
              member: {
                member_id: req.params.member_id,
                contactPreferences: contactPreferences
              }
            });
          } else {
            req.flash("error_msg", "Something went wrong!");
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/contact-preferences/" +
                member.member_id
            );
          }
        }
      );
    } else {
      res.render("error", {
        title: "Page Not Found",
        notFound: true
      });
    }
  });
});

module.exports = router;