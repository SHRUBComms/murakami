// /volunteers/roles/manage

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var VolunteerRoles = Models.VolunteerRoles;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteerRoles", "view"),
  function(req, res) {
    VolunteerRoles.getAll(function(err, roles, rolesGroupedByGroup) {
      res.render("volunteers/roles/manage", {
        title: "Manage Volunteer Roles",
        volunteerRolesActive: true,
        rolesGroupedByGroupId: rolesGroupedByGroup,
        roles: roles,
        group_id: req.query.group_id || req.user.working_groups[0]
      });
    });
  }
);

module.exports = router;
