// /settings/working-groups

var router = require("express").Router();
var h2p = require("html2plaintext");

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.use("/add", require("./add"));

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  if (req.user.working_groups) {
    var group = req.user.working_groups[0].group_id;
    res.redirect("/settings/working-groups/manage/" + group);
  } else {
    req.flash("error", "You're not an admin of any working groups!");
    res.redirect("/");
  }
});

router.get("/:group_id", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(
  req,
  res
) {
  WorkingGroups.getAll(function(err, working_groups) {
    if (working_groups[req.params.group_id]) {
      res.render("settings/working-groups/manage", {
        title: "Working Group Settings",
        workingGroupsActive: true,
        group: working_groups[req.params.group_id]
      });
    } else {
      res.redirect("/error");
    }
  });
});

router.post("/:group_id", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(
  req,
  res
) {
  WorkingGroups.getById(req.params.group_id, function(err, group) {
    if (group[0]) {
      group = group[0];
      var group_id = req.params.group_id;
      var name = req.body.name.trim();
      var prefix = req.body.prefix.trim() || null;
      var parent = req.body.parent || null;

      req.checkBody("name", "Please enter a group name").notEmpty();

      if (prefix) {
        req.checkBody("prefix", "Please enter a group name").notEmpty();
      }

      var errors = req.validationErrors();

      group.prefix = prefix;
      group.name = name;

      if (
        req.user.allWorkingGroupsObj[parent] &&
        !req.user.allWorkingGroupsObj[group_id].children
      ) {
        group.parent = parent;
      } else {
        group.parent = null;
      }

      if (h2p(req.body.welcomeMessage)) {
        group.welcomeMessage = req.body.welcomeMessage;
      } else {
        group.welcomeMessage = null;
      }

      if (!errors) {
        WorkingGroups.updateGroup(group, function(err) {
          req.flash("success_msg", "Group successfully updated!");
          res.redirect("/settings/working-groups/manage/" + group_id);
        });
      } else {
        res.render("settings/working-groups/manage", {
          errors: errors,
          title: "Working Group Settings",
          workingGroupsActive: true,
          group: group
        });
      }
    } else {
      res.redirect("/settings/working-groups/manage");
    }
  });
});

module.exports = router;
