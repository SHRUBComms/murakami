// /volunteers/roles/make-copy

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var WorkingGroups = Models.WorkingGroups;
var VolunteerRoles = Models.VolunteerRoles;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.get(
  "/:role_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteerRoles", "add"),
  function(req, res) {
    VolunteerRoles.getRoleById(req.params.role_id, function(err, role) {
      if (role) {
        if (
          req.user.permissions.volunteerRoles.view == true ||
          (req.user.permissions.volunteerRoles.view == "commonWorkingGroup" &&
            req.user.working_groups.includes(role.group_id))
        ) {
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
        }
      } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/manage");
      }
    });
  }
);

module.exports = router;
