// /till/select

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
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "processTransaction"),
  function(req, res) {
    Tills.getAll(function(err, tills) {
      var allowedTills = [];
      async.each(
        tills,
        function(till, callback) {
          if (
            (req.user.permissions.tills.viewTill == true &&
              till.disabled == 0) ||
            (req.user.permissions.tills.viewTill == "commonWorkingGroup" &&
              req.user.working_groups.includes(till.group_id) &&
              till.disabled == 0)
          ) {
            allowedTills.push(till);
            callback();
          } else {
            callback();
          }
        },
        function() {
          if (allowedTills.length > 1) {
            res.render("till/root", {
              tillMode: true,
              title: "Select A Till",
              tills: allowedTills
            });
          } else if (allowedTills.length == 1) {
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/till/transaction/" +
                allowedTills[0].till_id
            );
          } else {
            res.render("till/root", {
              tillMode: true,
              errors: [
                {
                  msg:
                    "No tills are available. Please contact an administrator."
                }
              ],
              title: "Select A Till",
              tills: allowedTills
            });
          }
        }
      );
    });
  }
);

module.exports = router;
