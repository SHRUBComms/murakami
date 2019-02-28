// /volunteers/roles/manage

var router = require("express").Router();

var rootDir = process.env.CWD;

var VolunteerRoles = require(rootDir + "/app/models/volunteer-roles");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get("/", Auth.isLoggedIn, function(req, res) {
  VolunteerRoles.getAll(function(err, roles, rolesGroupedByGroup) {
    res.render("volunteers/roles/manage", {
      title: "Manage Volunteer Roles",
      volunteerRolesActive: true,
      rolesGroupedByGroupId: rolesGroupedByGroup,
      roles: roles,
      group_id: req.query.group_id || null
    });
  });
});

module.exports = router;
