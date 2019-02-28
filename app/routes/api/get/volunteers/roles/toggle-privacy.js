// /api/get/volunteers/roles/toggle-privacy

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var VolunteerRoles = require(rootDir + "/app/models/volunteer-roles");

router.get("/:role_id", Auth.isLoggedIn, function(req, res) {
  var redirectURI =
    process.env.PUBLIC_ADDRESS + "/volunteers/roles/view/" + req.params.role_id;
  VolunteerRoles.getRoleById(req.params.role_id, function(err, role) {
    if (role) {
      if (role.public == 1) {
        VolunteerRoles.updateRolePrivacy(req.params.role_id, 0, function(err) {
          if (err) {
            req.flash("error", "Something went wrong!");
            res.redirect(redirectURI);
          } else {
            req.flash("success_msg", "Role set to private.");
            res.redirect(redirectURI);
          }
        });
      } else {
        VolunteerRoles.updateRolePrivacy(req.params.role_id, 1, function(err) {
          if (err) {
            req.flash("error", "Something went wrong!");
            res.redirect(redirectURI);
          } else {
            req.flash("success_msg", "Role set to public.");
            res.redirect(redirectURI);
          }
        });
      }
    } else {
      req.flash("error", "Role doesn't exist.");
      res.redirect(redirectURI);
    }
  });
});

module.exports = router;
