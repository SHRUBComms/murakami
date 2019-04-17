// volunteers/hours/export

var router = require("express").Router();

var rootDir = process.env.CWD;

var VolunteerHours = require(rootDir + "/app/models/volunteer-hours");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteerHours", "export"),
  function(req, res) {
    VolunteerHours.getHoursBetweenTwoDatesByWorkingGroup(
      req.query.group_id,
      req.query.startDate,
      req.query.endDate,
      function(err, shifts) {
        res.render("volunteers/hours/export", {
          volunteerHoursActive: true,
          title: "Export Data",
          group: {
            group_id: req.query.group_id || null
          },
          startDate: req.query.startDate || null,
          endDate: req.query.endDate || null,
          shifts: shifts
        });
      }
    );
  }
);

module.exports = router;
