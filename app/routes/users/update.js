// /users/update

var router = require("express").Router();
var async = require("async");
var lodash = require("lodash");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Users = Models.Users;
var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.get(
  "/:user_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("users", "view"),
  function(req, res) {
    Users.getById(req.params.user_id, req.user, function(err, user) {
      if (!err || user) {
        if (user.canUpdate) {
          res.render("users/update", {
            usersActive: true,
            title: "Update User",
            viewedUser: user
          });
        } else {
          req.flash(
            "error_msg",
            "You don't have permission to update this user!"
          );
          res.redirect(process.env.PUBLIC_ADDRESS + "/users/manage");
        }
      } else {
        req.flash("error_msg", "User not found!");
        res.redirect(process.env.PUBLIC_ADDRESS + "/users/manage");
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
      if (!err && user) {
        if (user.canUpdate) {
          var first_name = req.body.first_name.trim();
          var last_name = req.body.last_name.trim();
          var userClass = req.body.class;
          var working_groups = req.body.working_groups || [];
          var isUser = false;
          var notification_preferences, sanitized_notification_preferences;

          if (req.user.id == req.params.user_id) {
            isUser = true;
            notification_preferences = req.body.notification_preferences;

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
              if (
                notification_preferences["pending-volunteer-hours"]["email"]
              ) {
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
                notification_preferences["volunteers-need-to-volunteer"][
                  "email"
                ]
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
                sanitized_notification_preferences["unfinished-roles"][
                  "email"
                ] = "on";
              }
            } catch (err) {}
          } else {
            sanitized_notification_preferences = user.notification_preferences;
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

          var validClasses, validWorkingGroups;

          if (req.user.class == "admin") {
            validClasses = ["admin", "till", "volunteer", "staff"];
          } else {
            validClasses = ["till", "volunteer", "staff"];
          }

          if (req.user.permissions.users.update == true) {
            validWorkingGroups = req.user.allWorkingGroupsFlat;
          } else if (
            req.user.permissions.users.update == "commonWorkingGroup"
          ) {
            validWorkingGroups = user.working_groups;
            validWorkingGroups.push(req.user.working_groups);
            validWorkingGroups = lodash.uniq(validWorkingGroups);
          } else {
            validWorkingGroups = [];
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

          if (working_groups.length == 0) {
            errors.push({
              msg: "Please select at least one working group."
            });
          }

          if (!Helpers.allBelongTo(working_groups, validWorkingGroups)) {
            errors.push({
              msg: "Please select valid working groups."
            });
          }

          console.log("validated");

          if (errors[0]) {
            console.log("not valid");
            res.render("users/update", {
              usersActive: true,
              title: "Update User",
              errors: errors,
              viewedUser: {
                canUpdate: true,
                id: user.id,
                first_name: first_name,
                last_name: last_name,
                email: user.email,
                username: user.username,
                class: userClass,
                working_groups: working_groups,
                last_login: user.lastLogin,
                notification_preferences: notification_preferences
              }
            });
          } else {
            console.log("valid");
            var updatedUser = { user_id: req.params.user_id, class: userClass };

            if (req.user.permissions.users.name || isUser) {
              updatedUser.first_name = first_name;
              updatedUser.last_name = last_name;
            } else {
              updatedUser.first_name = user.first_name;
              updatedUser.last_name = user.last_name;
            }

            if (req.user.permissions.users.workingGroups || isUser) {
              updatedUser.working_groups = working_groups.sort();
            } else {
              updatedUser.working_groups = user.working_groups.sort();
            }

            if (isUser) {
              updatedUser.notification_preferences = sanitized_notification_preferences;
            }

            console.log(updatedUser);

            Users.updateUser(updatedUser, function(err, user) {
              if (!err) {
                req.flash("success_msg", "User updated!");
                res.redirect(
                  process.env.PUBLIC_ADDRESS +
                    "/users/update/" +
                    req.params.user_id
                );
              } else {
                res.render("users/update", {
                  usersActive: true,
                  title: "Update User",
                  errors: [{ msg: "Something went wrong - please try again!" }],
                  viewedUser: {
                    canUpdate: true,
                    id: user.id,
                    first_name: first_name,
                    last_name: last_name,
                    email: user.email,
                    username: user.username,
                    class: userClass,
                    working_groups: working_groups,
                    last_login: user.lastLogin,
                    notification_preferences: notification_preferences
                  }
                });
              }
            });
          }
        }
      } else {
        req.flash("error_msg", "Something went wrong, please try again!");
        res.redirect(
          process.env.PUBLIC_ADDRESS + "/users/update/" + req.params.user_id
        );
      }
    });
  }
);

module.exports = router;
