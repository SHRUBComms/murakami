// /working-groups/add

var router = require("express").Router();
var h2p = require("html2plaintext");

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(req, res) {
  res.render("working-groups/add", {
    title: "Add Working Group",
    workingGroupsActive: true
  });
});

router.post("/", Auth.isLoggedIn, Auth.isOfClass(["admin"]), function(
  req,
  res
) {
  var group = {
    prefix: req.body.prefix,
    name: req.body.name,
    parent: req.body.parent || null,
    welcomeMessage: req.body.welcomeMessage || null
  };

  if (h2p(group.welcomeMessage) == null) {
    group.welcomeMessage = null;
  }

  if (
    !req.user.allWorkingGroupsObj[group.parent] ||
    req.user.allWorkingGroupsObj[group.parent].parent
  ) {
    group.parent = null;
  }

  WorkingGroups.addWorkingGroup(group, function(err, group_id) {
    if (err) {
      res.render("working-groups/add", {
        title: "Add Working Group",
        workingGroupsActive: true,
        errors: [{ msg: "Something went wrong!" }],
        name: group.name,
        prefix: group.prefix,
        welcomeMessage: group.welcomeMessage
      });
    } else {
      req.flash("success_msg", "Working group added successfully!");
      res.redirect(
        process.env.PUBLIC_ADDRESS +
          "/working-groups/manage/" +
          group_id
      );
    }
  });
});

module.exports = router;
