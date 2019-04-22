// /users/view

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/:user_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("users", "update"),
  function(req, res) {
    Users.getById(req.params.user_id, req.user, function(err, user) {
      if (err || !user[0].first_name || user[0].deactivated == 1) {
        req.flash("error_msg", "User not found!");
        res.redirect(process.env.PUBLIC_ADDRESS + "/users/manage");
      } else {
        user = user[0];

        res.render("users/view", {
          usersActive: true,
          title: "View User",
          user_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          username: user.username,
          class: user.class,
          working_groups: user.working_groups,
          notification_preferences: user.notification_preferences,
          last_login: user.lastLogin
        });
      }
    });
  }
);

module.exports = router;
