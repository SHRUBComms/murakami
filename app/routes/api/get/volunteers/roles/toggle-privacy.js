// /api/get/volunteers/roles/toggle-privacy

var router = require("express").Router();

var rootDir = process.env.CWD;

var Volunteers = require(rootDir + "/app/models/volunteers");

router.get("/:role_id", Auth.isLoggedIn, function(req, res) {
  var redirectURI =
    process.env.PUBLIC_ADDRESS + "/volunteers/roles/view/" + req.params.role_id;
  Volunteers.getRoleById(req.params.role_id, function(err, role) {
    if (role) {
      if (role.public == 1) {
        Volunteers.updateRolePrivacy(req.params.role_id, 0, function(err) {
          if (err) {
            req.flash("error", "Something went wrong!");
            res.redirect(redirectURI);
          } else {
            req.flash("success_msg", "Role set to private.");
            res.redirect(redirectURI);
          }
        });
      } else {
        Volunteers.updateRolePrivacy(req.params.role_id, 1, function(err) {
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
