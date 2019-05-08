// /api/get/volunteers/roles/activate

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Models = require(rootDir + "/app/models/sequelize");
var VolunteerRoles = Models.VolunteerRoles;

router.get(
  "/:role_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteerRoles", "update"),
  function(req, res) {
    var redirectURI =
      process.env.PUBLIC_ADDRESS +
      "/volunteers/roles/view/" +
      req.params.role_id;
    VolunteerRoles.getRoleById(req.params.role_id, function(err, role) {
      if (role) {
        if (
          req.user.permissions.volunteerRoles.update == true ||
          (req.user.permissions.volunteerRoles.update == "commonWorkingGroup" &&
            req.user.working_groups.includes(role.group_id))
        ) {
          if (role.removed == 1) {
            VolunteerRoles.activateRole(req.params.role_id, function(err) {
              if (err) {
                req.flash("error", "Something went wrong!");
                res.redirect(redirectURI);
              } else {
                req.flash("success_msg", "Role activated.");
                res.redirect(redirectURI);
              }
            });
          } else {
            req.flash("error_msg", "Role already active.");
            res.redirect(redirectURI);
          }
        } else {
          req.flash("error", "You don' have permission to activate this role!");
          res.redirect(redirectURI);
        }
      } else {
        req.flash("error", "Role doesn't exist.");
        res.redirect(redirectURI);
      }
    });
  }
);

module.exports = router;
