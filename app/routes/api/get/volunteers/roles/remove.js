// /api/get/volunteers/roles/toggle-privacy

var router = require("express").Router();

var rootDir = process.env.CWD;

var Volunteers = require(rootDir + "/app/models/volunteers");

router.get("/:role_id", Auth.isLoggedIn, function(req, res) {
  var redirectURI = process.env.PUBLIC_ADDRESS + "/volunteers/roles/manage";
  Volunteers.getRoleById(req.params.role_id, function(err, role) {
    if (role) {
      if (role.removed == 0) {
        Volunteers.removeRole(req.params.role_id, function(err) {
          if (err) {
            req.flash("error", "Something went wrong!");
            res.redirect(redirectURI);
          } else {
            req.flash("success_msg", "Role deactivated.");
            res.redirect(redirectURI);
          }
        });
      } else {
        req.flash("error_msg", "Role already inactive.");
        res.redirect(redirectURI);
      }
    } else {
      req.flash("error", "Role doesn't exist.");
      res.redirect(redirectURI);
    }
  });
});

module.exports = router;
