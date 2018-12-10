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
      var tillMode = false;
      var till_id = req.query.till_id || null;
      if (till_id) {
        tillMode = true;
      }
      res.render("log-outgoing-weight", {
        tillMode: tillMode,
        till: {
          till_id: till_id
        },
        carbonActive: true,
        title: "Log Outgoing Weight",
        carbonCategories: carbonCategories,
        working_groups: working_groups,
        till: {
          till_id: req.query.till_id
        }
      });
    });
  });
});

module.exports = router;
