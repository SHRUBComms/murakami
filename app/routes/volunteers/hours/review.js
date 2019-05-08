// /volunteers/hours/review

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteerHours", "review"),
  function(req, res) {
    res.render("volunteers/hours/review", {
      title: "Review Volunteer Hours",
      volunteerHoursActive: true,
      group: {
        group_id: null
      }
    });
  }
);

router.get(
  "/:group_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteerHours", "review"),
  function(req, res) {
    if (
      req.user.permissions.volunteerHours.review == true ||
      (req.user.permissions.volunteerHours.review == "commonWorkingGroup" &&
        req.user.working_groups.includes(req.params.group_id))
    ) {
      WorkingGroups.getById(req.params.group_id, function(err, group) {
        if (group) {
          res.render("volunteers/hours/review", {
            title: "Review Volunteer Hours",
            volunteerHoursActive: true,
            group: group
          });
        } else {
          res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/review");
        }
      });
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/hours/review");
    }
  }
);

module.exports = router;
