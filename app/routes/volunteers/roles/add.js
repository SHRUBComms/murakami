// /volunteers/roles/add

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin", "staff"]), function(
  req,
  res
) {
  console.log(req.user.working_groups);
  res.render("volunteers/roles/add", {
    volunteerRolesActive: true,
    title: "Add Volunteer Role"
  });
});

router.post("/", Auth.isLoggedIn, Auth.isOfClass(["admin", "staff"]), function(
  req,
  res
) {
  var group_id = req.body.group_id;
  var role = {};
  var public = req.body.public;

  // Validate role.

  // Fomat public variable.
  if (public == "on") {
    public = 1;
  } else {
    public = 0;
  }

  var working_groups;
  if (req.user.class == "staff") {
    working_groups = req.user.working_groups;
  } else {
    WorkingGroups.getAll(function(err, allWorkingGroups) {
      working_groups = allWorkingGroups;
    });
  }

  var found = false;
  async.each(
    working_groups,
    function(group, callback) {
      if (group_id == group.group_id) {
        found = true;
      }
      callback();
    },
    function() {
      if (found == false) {
        group_id = null;
      }
    }
  );
});

module.exports = router;
