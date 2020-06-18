// /settings/data-permissions

var router = require("express").Router();
var lodash = require("lodash");
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var DataPermissions = Models.DataPermissions;
var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");

var userClasses = ["till", "volunteer", "staff", "admin"];

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  res.redirect(
    process.env.PUBLIC_ADDRESS + "/settings/data-permissions/" + userClasses[0]
  );
});

router.get("/:user_class", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(
  req,
  res
) {
  if (userClasses.includes(req.params.user_class)) {
    DataPermissions.getAll(function(err, permissions) {
      var orderedPermissions = {};
      Object.keys(permissions[req.params.user_class])
        .sort()
        .forEach(
          key =>
            (orderedPermissions[key] = permissions[req.params.user_class][key])
        );
      res.render("settings/data-permissions", {
        title: "Data Permissions",
        settingsActive: true,
        permissions: orderedPermissions,
        userClass: req.params.user_class
      });
    });
  } else {
    res.redirect(
      process.env.PUBLIC_ADDRESS +
        "/settings/data-permissions/" +
        userClasses[0]
    );
  }
});

router.post(
  "/:user_class",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin"]),
  function(req, res) {
    if (userClasses.includes(req.params.user_class)) {
      var validPermissions = ["true", "false", "commonWorkingGroup", "isCoordinator"];
      var newPermissions = req.body.permissions;
      var sanitizedPermissions = {};
      DataPermissions.getAll(function(err, permissions) {
        permissions = permissions[req.params.user_class];
        var newPermissions = req.body.permissions;
        async.eachOf(
          permissions,
          function(subject, subjectKey, callback) {
            if (newPermissions[subjectKey]) {
              sanitizedPermissions[subjectKey] = {};
              async.eachOf(
                subject,
                function(specific, specificKey, callback) {
                  sanitizedPermissions[subjectKey][specificKey] = false;

                  if (
                    validPermissions.includes(
                      newPermissions[subjectKey][specificKey]
                    )
                  ) {
                    try {
                      sanitizedPermissions[subjectKey][
                        specificKey
                      ] = JSON.parse(newPermissions[subjectKey][specificKey]);
                    } catch (err) {
                      sanitizedPermissions[subjectKey][specificKey] =
                        newPermissions[subjectKey][specificKey];
                    }
                  }
                  callback();
                },
                function() {
                  callback();
                }
              );
            } else {
              sanitizedPermissions[subjectKey] = permissions[subjectKey];
              callback();
            }
          },
          function() {
            DataPermissions.updatePermission(
              req.params.user_class,
              sanitizedPermissions,
              function(err) {
                if (!err) {
                  req.flash("success_msg", "Permissions updated!");
                  res.redirect(
                    process.env.PUBLIC_ADDRESS +
                      "/settings/data-permissions/" +
                      req.params.user_class
                  );
                } else {
                  req.flash(
                    "error_msg",
                    "Something went wrong! Please try again."
                  );
                  res.redirect(
                    process.env.PUBLIC_ADDRESS +
                      "/settings/data-permissions/" +
                      req.params.user_class
                  );
                }
              }
            );
          }
        );
      });
    }
  }
);

module.exports = router;
