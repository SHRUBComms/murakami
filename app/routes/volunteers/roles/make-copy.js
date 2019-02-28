// /volunteers/roles/make-copy

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var VolunteerRoles = require(rootDir + "/app/models/volunteer-roles");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/:role_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff"]),
  function(req, res) {
    VolunteerRoles.getRoleById(req.params.role_id, function(err, role) {
      if (role) {
        role.details.working_group = role.group_id;
        if (!Array.isArray(role.details.activities)) {
          role.details.activities = [role.details.activities];
        }
        if (!Array.isArray(role.details.locations)) {
          role.details.locations = [role.details.locations];
        }

        VolunteerRoles.getRoleSignUpInfo(function(
          allLocations,
          allActivities,
          commitmentLengths
        ) {
          res.render("volunteers/roles/add", {
            title: "Duplicate Volunter Role",
            volunteerRolesActive: true,
            role: role.details,
            availability: role.availability,
            locations: allLocations,
            commitmentLengths: commitmentLengths,
            activities: allActivities
          });
        });
      } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/manage");
      }
    });
  }
);

module.exports = router;
