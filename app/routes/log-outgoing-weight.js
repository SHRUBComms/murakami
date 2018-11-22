// /log-outgoing-weight

var router = require("express").Router();

var rootDir = process.env.CWD;

var Carbon = require(rootDir + "/app/models/carbon-calculations");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  WorkingGroups.getAll(function(err, working_groups) {
    Carbon.getCategories(function(err, carbonCategories) {
      carbonCategories = Object.values(carbonCategories);
      res.render("log-outgoing-weight", {
        carbonActive: true,
        title: "Log Outgoing Weight (Non-member)",
        carbonCategories: carbonCategories,
        working_groups: working_groups
      });
    });
  });
});

module.exports = router;
