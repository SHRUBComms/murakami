// volunteers/hours/export

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var VolunteerHours = Models.VolunteerHours;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteerHours", "export"),
  function(req, res) {
    var group_id;
    if (
      req.user.permissions.volunteerHours.export == true ||
      (req.user.permissions.volunteerHours.export == "commonWorkingGroup" &&
        req.user.working_groups.includes(req.query.group_id))
    ) {
      group_id = req.query.group_id;
    }
    VolunteerHours.getHoursBetweenTwoDatesByWorkingGroup(
      group_id,
      req.query.startDate,
      req.query.endDate,
      function(err, shifts) {
        res.render("volunteers/hours/export", {
          volunteerHoursActive: true,
          title: "Export Data",
          group: {
            group_id: group_id || null
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
