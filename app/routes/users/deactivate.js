// /users/deactivate

var router = require("express").Router();

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/:user_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff"]),
  function(req, res) {
    Users.getById(req.params.user_id, req.user, function(err, user) {
      if (user[0] && !err && !user[0].deactivated) {
        var user = user[0];

        var validClasses = [];
        if (req.user.class == "admin") {
          validClasses = ["admin", "staff", "volunteer", "till"];
        } else {
          validClasses = ["till", "volunteer"];
        }

        if (
          req.user.class == "admin" ||
          (Helpers.hasOneInCommon(
            req.user.working_groups,
            user.working_groups
          ) &&
            validClasses.includes(user.class))
        ) {
          Users.deactivate(user.id, function(err) {
            if (err) {
              req.flash("error", "Something went wrong!");
              res.redirect(
                process.env.PUBLIC_ADDRESS + "/users/update/" + user.id
              );
            } else {
              req.flash("success_msg", "User deactivated!");
              res.redirect(process.env.PUBLIC_ADDRESS + "/users/manage");
            }
          });
        } else {
          req.flash("error", "You don't have permission to do that!");
          res.redirect(process.env.PUBLIC_ADDRESS + "/users/update/" + user.id);
        }
      } else {
        req.flash("error", "Something went wrong.");
        res.redirect(process.env.PUBLIC_ADDRESS + "/users/manage");
      }
    });
  }
);

module.exports = router;
