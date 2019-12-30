// /till/manage

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var TillActivity = Models.TillActivity;
var CarbonCategories = Models.CarbonCategories;
var StockCategories = Models.StockCategories;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "viewTill"),
  function(req, res) {
    Tills.getAll(function(err, tills) {
      TillActivity.getAll(function(err, activity) {
        var allowedTills = [];
        async.each(
          tills,
          function(till, callback) {
            if (
              req.user.permissions.tills.viewTill == true ||
              (req.user.permissions.tills.viewTill == "commonWorkingGroup" &&
                req.user.working_groups.includes(till.group_id))
            ) {
              allowedTills.push(till);
              callback();
            } else {
              callback();
            }
          },
          function() {
            res.render("till/manage", {
              title: "Manage Tills",
              tillsActive: true,
              tills: allowedTills,
              activity: activity
            });
          }
        );
      });
    });
  }
);

module.exports = router;
