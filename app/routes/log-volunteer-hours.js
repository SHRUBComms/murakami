// /log-volunteer-hours

var router = require("express").Router();
var Recaptcha = require("express-recaptcha").Recaptcha;

var rootDir = process.env.CWD;
var recaptcha = new Recaptcha(
  process.env.RECAPTCHA_SITE_KEY,
  process.env.RECAPTCHA_SECRET_KEY
);

var WorkingGroups = require(rootDir + "/app/models/working-groups");

router.get("/", function(req, res) {
  WorkingGroups.getAll(function(err, working_groups) {
    if (req.user) {
      var tillMode = false;
      var till_id = req.query.till_id || null;
      if (till_id) {
        tillMode = true;
      }
      res.render("log-volunteer-hours", {
        tillMode: tillMode,
        logVolunteerHoursActive: true,
        till: {
          till_id: till_id
        },
        title: "Log Volunteer Hours",
        volunteerHoursActive: true,
        captcha: recaptcha.render(),
        working_groups: working_groups
      });
    } else {
      var till_id = req.query.till_id;
      res.render("log-volunteer-hours", {
        title: "Log Volunteer Hours",
        logoutActive: true,
        captcha: recaptcha.render(),
        working_groups: working_groups,
        till: {
          till_id: till_id
        }
      });
    }
  });
});

module.exports = router;
