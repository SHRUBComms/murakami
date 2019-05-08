// /working-groups/manage

var router = require("express").Router();
var h2p = require("html2plaintext");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("workingGroups", "view"),
  function(req, res) {
    if (req.user.working_groups.length > 0) {
      var group = req.user.working_groups[0];

      res.redirect(
        process.env.PUBLIC_ADDRESS + "/working-groups/manage/" + group
      );
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/");
    }
  }
);

router.get(
  "/:group_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("workingGroups", "view"),
  function(req, res) {
    if (
      req.user.permissions.workingGroups.view == true ||
      (req.user.permissions.workingGroups.view == "commonWorkingGroup" &&
        req.user.working_groups.includes(req.params.group_id))
    ) {
      var canUpdate;

      if (
        req.user.permissions.workingGroups.update == true ||
        (req.user.permissions.workingGroups.update == "commonWorkingGroup" &&
          req.user.working_groups.includes(req.params.group_id))
      ) {
        canUpdate = true;
      }

      WorkingGroups.getAll(function(err, working_groups) {
        if (working_groups[req.params.group_id]) {
          res.render("working-groups/manage", {
            title: "Working Group Settings",
            workingGroupsActive: true,
            group: working_groups[req.params.group_id],
            canUpdate: canUpdate
          });
        } else {
          res.redirect(process.env.PUBLIC_ADDRESS + "/error");
        }
      });
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/working-groups/manage/");
    }
  }
);

router.post(
  "/:group_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("workingGroups", "update"),
  function(req, res) {
    if (
      req.user.permissions.workingGroups.update == true ||
      (req.user.permissions.workingGroups.update == "commonWorkingGroup" &&
        req.user.working_groups.includes(req.params.group_id))
    ) {
      WorkingGroups.getById(req.params.group_id, function(err, group) {
        if (group) {
          var group_id = req.params.group_id;
          var name = req.body.name.trim();
          var prefix = req.body.prefix.trim() || null;
          var parent = req.body.parent || null;

          req.checkBody("name", "Please enter a group name").notEmpty();

          if (prefix) {
            req.checkBody("prefix", "Please enter a group name").notEmpty();
          }

          var errors = req.validationErrors();

          group.name = name;

          if (req.user.permissions.workingGroups.update == true) {
            group.prefix = prefix;

            if (
              req.user.allWorkingGroupsObj[parent] &&
              !req.user.allWorkingGroupsObj[group_id].children
            ) {
              group.parent = parent;
            } else {
              group.parent = null;
            }
          }
          if (h2p(req.body.welcomeMessage)) {
            group.welcomeMessage = req.body.welcomeMessage;
          } else {
            group.welcomeMessage = null;
          }

          if (!errors) {
            WorkingGroups.updateGroup(group, function(err) {
              req.flash("success_msg", "Group successfully updated!");
              res.redirect(
                process.env.PUBLIC_ADDRESS +
                  "/working-groups/manage/" +
                  group_id
              );
            });
          } else {
            res.render("working-groups/manage", {
              errors: errors,
              title: "Working Group Settings",
              workingGroupsActive: true,
              group: group
            });
          }
        } else {
          res.redirect(process.env.PUBLIC_ADDRESS + "/working-groups/manage");
        }
      });
    } else {
      res.redirect(process.env.PUBLIC_ADDRESS + "/working-groups/manage/");
    }
  }
);

module.exports = router;
