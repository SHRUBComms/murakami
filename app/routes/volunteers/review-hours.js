// /volunteers/review-hours

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin", "staff"]), function(
  req,
  res
) {
  if (req.user.working_groups.length > 0) {
    var group = req.user.working_groups[0].group_id;
    res.redirect("/volunteers/review-hours/" + group);
  } else {
    res.redirect("/error");
  }
});

router.get(
  "/:group_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff"]),
  function(req, res) {
    WorkingGroups.getById(req.params.group_id, function(err, group) {
      if (group) {
        group = group[0];

        res.render("workingGroups/review-volunteer-hours", {
          title: "Review Volunteer Hours",
          volunteerHoursActive: true,
          group: group
        });
      } else {
        res.redirect("/working-groups");
      }
    });
  }
);

module.exports = router;
