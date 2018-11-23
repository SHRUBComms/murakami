// /settings/working-groups

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isAdmin, function(req, res) {
  if (req.user.working_groups) {
    var group = req.user.working_groups[0].group_id;
    res.redirect("/settings/working-groups/" + group);
  } else {
    req.flash("error", "You're not an admin of any working groups!");
    res.redirect("/");
  }
});

router.get("/:group_id", Auth.isLoggedIn, Auth.isAdmin, function(req, res) {
  WorkingGroups.getAll(function(err, working_groups) {
    if (working_groups[req.params.group_id]) {
      res.render("settings/working-groups", {
        title: "Working Group Settings",
        settingsActive: true,
        group: working_groups[req.params.group_id]
      });
    } else {
      res.redirect("/error");
    }
  });
});

router.post("/:group_id", Auth.isLoggedIn, Auth.isAdmin, function(req, res) {
  WorkingGroups.getById(req.params.group_id, function(err, group) {
    if (group[0]) {
      group = group[0];
      var group_id = req.params.group_id;
      var name = req.body.name.trim();
      var prefix = req.body.prefix.trim() || null;
      var rate = req.body.rate || 0;

      req.checkBody("name", "Please enter a group name").notEmpty();

      if (prefix) {
        req.checkBody("prefix", "Please enter a group name").notEmpty();
      }

      req
        .checkBody("rate", "Please enter a rate (set to 0 if unwanted)")
        .notEmpty();
      req
        .checkBody(
          "rate",
          "Please enter a valid rate (a whole number between 0 and 5)"
        )
        .isInt({ gt: -1, lt: 6 });

      var errors = req.validationErrors();

      group.prefix = prefix;
      group.name = name;
      group.rate = rate;

      if (!errors) {
        WorkingGroups.updateGroup(group, function(err) {
          req.flash("success_msg", "Group successfully updated!");
          res.redirect("/settings/working-groups/" + group_id);
        });
      } else {
        res.render("settings/working-groups", {
          errors: errors,
          title: "Working Group Settings",
          settingsActive: true,
          group: group
        });
      }
    } else {
      res.redirect("/settings/working-groups/");
    }
  });
});

module.exports = router;
