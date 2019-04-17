// /users/update

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

        res.render("users/update", {
          usersActive: true,
          title: "Update User",
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

router.post(
  "/:user_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("users", "update"),
  function(req, res) {
    Users.getById(req.params.user_id, req.user, function(err, user) {
      if (err || !user[0] || user[0].deactivated || !user[0].first_name) {
        req.flash("error_msg", "Something went wrong, please try again!");
        res.redirect(
          process.env.PUBLIC_ADDRESS + "/users/update/" + req.params.user_id
        );
      } else {
        user = user[0];
        var first_name = req.body.first_name.trim();
        var last_name = req.body.last_name.trim();
        var userClass = req.body.class;
        var working_groups = req.body.working_groups || [];

        if (req.user.id == req.params.user_id) {
          var notification_preferences = req.body.notification_preferences;

          var sanitized_notification_preferences = {
            "pending-volunteer-hours": {
              email: "off",
              murakami: "off"
            },
            "volunteers-need-to-volunteer": {
              email: "off",
              murakami: "off"
            },
            "unfinished-roles": {
              email: "off",
              murakami: "off"
            }
          };

          try {
            if (
              notification_preferences["pending-volunteer-hours"]["murakami"]
            ) {
              sanitized_notification_preferences["pending-volunteer-hours"][
                "murakami"
              ] = "on";
            }
          } catch (err) {}

          try {
            if (notification_preferences["pending-volunteer-hours"]["email"]) {
              sanitized_notification_preferences["pending-volunteer-hours"][
                "email"
              ] = "on";
            }
          } catch (err) {}

          try {
            if (
              notification_preferences["volunteers-need-to-volunteer"][
                "murakami"
              ]
            ) {
              sanitized_notification_preferences[
                "volunteers-need-to-volunteer"
              ]["murakami"] = "on";
            }
          } catch (err) {}

          try {
            if (
              notification_preferences["volunteers-need-to-volunteer"]["email"]
            ) {
              sanitized_notification_preferences[
                "volunteers-need-to-volunteer"
              ]["email"] = "on";
            }
          } catch (err) {}

          try {
            if (notification_preferences["unfinished-roles"]["murakami"]) {
              sanitized_notification_preferences["unfinished-roles"][
                "murakami"
              ] = "on";
            }
          } catch (err) {}

          try {
            if (notification_preferences["unfinished-roles"]["email"]) {
              sanitized_notification_preferences["unfinished-roles"]["email"] =
                "on";
            }
          } catch (err) {}
        } else {
          var sanitized_notification_preferences =
            user.notification_preferences;
        }

        // Validation
        req.checkBody("first_name", "Please enter a first name").notEmpty();
        req
          .checkBody(
            "first_name",
            "Please enter a shorter first name (<= 20 characters)"
          )
          .isLength({ max: 20 });

        req.checkBody("last_name", "Please enter a last name").notEmpty();
        req
          .checkBody(
            "last_name",
            "Please enter a shorter last name (<= 30 characters)"
          )
          .isLength({ max: 30 });

        // Parse request's body
        var errors = req.validationErrors() || [];

        var validClasses;

        if (req.user.class == "admin") {
          validClasses = ["admin", "till", "volunteer", "staff"];
        } else {
          validClasses = ["till", "volunteer"];
        }

        if (req.user.class == "staff") {
          if (req.user.id == req.params.user_id) {
            validClasses.push("staff");
          }
        }

        if (!validClasses.includes(userClass)) {
          var error = {
            msg: "Please select a valid user class."
          };
          errors.push(error);
        }

        if (!Array.isArray(working_groups)) {
          working_groups = [working_groups];
        }

        if (
          !Helpers.allBelongTo(working_groups, req.user.allWorkingGroupsFlat)
        ) {
          errors.push({
            msg: "Please select valid working groups."
          });
        }

        if (errors[0]) {
          res.render("users/update", {
            usersActive: true,
            title: "Update User",
            errors: errors,
            user_id: user.id,
            first_name: first_name,
            last_name: last_name,
            email: user.email,
            username: user.username,
            class: userClass,
            working_groups: working_groups,
            last_login: user.lastLogin,
            notification_preferences: notification_preferences
          });
        } else {
          var updatedUser = {
            user_id: req.params.user_id,
            first_name: first_name,
            last_name: last_name,
            class: userClass,
            working_groups: JSON.stringify(working_groups.sort()),
            notification_preferences: JSON.stringify(
              sanitized_notification_preferences
            )
          };

          Users.update(updatedUser, function(err, user) {
            req.flash("success_msg", "User updated!");
            res.redirect(
              process.env.PUBLIC_ADDRESS + "/users/update/" + req.params.user_id
            );
          });
        }
      }
    });
  }
);

module.exports = router;
