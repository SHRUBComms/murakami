// /till/view

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Tills = Models.Tills;
var TillActivity = Models.TillActivity;
var Transactions = Models.Transactions;
var StockCategories = Models.StockCategories;
var WorkingGroups = Models.WorkingGroups;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:till_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "viewTill"),
  function(req, res) {
    Tills.getAll(function(err, tills) {
      async.eachOf(
        tills,
        function(till, key, callback) {
          if (
            req.user.permissions.tills.viewTill == true ||
            (req.user.permissions.tills.viewTill == "commonWorkingGroup" &&
              req.user.working_groups.includes(till.group_id))
          ) {
            TillActivity.getByTillId(till.till_id, function(status) {
              till.status = status;
              callback();
            });
          } else {
            till[key] = {};
            callback();
          }
        },
        function() {
          res.render("till/manage", {
            title: "Manage Tills",
            tillsActive: true,
            tillDashboardActive: true,
            tills: tills
          });
        }
      );
    });
  }
);

module.exports = router;
