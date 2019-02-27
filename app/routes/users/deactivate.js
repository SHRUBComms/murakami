// /users/deactivate

var router = require("express").Router();

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:user_id", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(
  req,
  res
) {
  Users.getById(req.params.user_id, req.user, function(err, user) {
    if (user[0] && !err && !user[0].deactivated) {
      var user = user[0];

      Users.deactivate(user.id, function(err) {
        if (err) {
          req.flash("error", "Something went wrong!");
          res.redirect(process.env.PUBLIC_ADDRESS + "/users/update/" + user.id);
        } else {
          req.flash("success_msg", "User deactivated!");
          res.redirect(process.env.PUBLIC_ADDRESS + "/users/manage");
        }
      });
    } else {
      req.flash("error", "Something went wrong.");
      res.redirect(process.env.PUBLIC_ADDRESS + "/users/manage");
    }
  });
});

module.exports = router;
