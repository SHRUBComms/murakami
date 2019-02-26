// /volunteers/roles/view

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Volunteers = require(rootDir + "/app/models/volunteers");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get("/:role_id", function(req, res) {
  Volunteers.getRoleById(req.params.role_id, function(err, role) {
    WorkingGroups.getById(role.group_id, function(err, group) {
      if (role) {
        res.render("volunteers/roles/view", {
          title: "View Volunter Role",
          volunteerRolesActive: true,
          role: role,
          group: group[0]
        });
      } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/manage");
      }
    });
  });
});

module.exports = router;
