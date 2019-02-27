// /volunteers/hours/review

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:group_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    WorkingGroups.getById(req.params.group_id, function(err, group) {
      if (group) {
        group = group[0];

        res.render("volunteers/hours/review", {
          title: "Review Volunteer Hours",
          volunteerHoursActive: true,
          group: group
        });
      } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/error");
      }
    });
  }
);

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
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

module.exports = router;
