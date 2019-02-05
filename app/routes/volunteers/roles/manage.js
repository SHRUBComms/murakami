// /volunteers/roles/manage

var router = require("express").Router();

var rootDir = process.env.CWD;

var Volunteers = require(rootDir + "/app/models/volunteers");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get("/", Auth.isLoggedIn, function(req, res) {
  Volunteers.getAllRoles(function(err, roles, rolesGroupedByGroup) {
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
