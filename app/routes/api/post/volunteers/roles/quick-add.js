// /api/post/volunteers/roles/quick-add

var router = require("express").Router();

var rootDir = process.env.CWD;

var VolunteerRoles = require(rootDir + "/app/models/volunteer-roles");

var Auth = require(rootDir + "/app/configs/auth");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteerRoles", "quickAdd"),
  function(req, res) {
    var working_group = req.body.working_group;
    var title = req.body.title;
    var working_groups;
    if (req.user.permissions.volunteerRoles.quickAdd == true) {
      working_groups = req.user.allWorkingGroupsFlat;
    } else if (
      req.user.permissions.volunteerRoles.quickAdd == "commonWorkingGroup"
    ) {
      working_groups = req.user.working_groups;
    }

    if (working_groups.includes(working_group) && title) {
      VolunteerRoles.quickAddRole(working_group, title, function(err, role) {
        if (!err && role) {
          res.send({ status: "ok", role: role });
        } else {
          res.send({ status: "fail", msg: "Something went wrong!" });
        }
      });
    } else {
      res.send({
        status: "fail",
        msg: "Please enter a title and a valid working group."
      });
    }
  }
);

module.exports = router;
