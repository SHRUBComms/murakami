// /working-groups/members

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin", "volunteer"]), function(req, res) {
  if (req.user.working_groups) {
    var group = req.user.working_groups[0].group_id;
    res.redirect("/working-groups/induct-volunteers/" + group);
  } else {
    req.flash("error", "You're not an admin of any working groups!");
    res.redirect("/members");
  }
});

router.get("/:group_id", Auth.isLoggedIn, Auth.isOfClass(["admin", "volunteer"]), function(
  req,
  res
) {
  WorkingGroups.getById(req.params.group_id, function(err, group) {
    if (group) {
      group = group[0];
      res.render("workingGroups/induct-volunteers", {
        title: "Induct/Manage Volunteers",
        volunteersActive: true,
        group: group
      });
    } else {
      res.redirect("/members");
    }
  });
});

module.exports = router;
