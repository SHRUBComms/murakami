// /till/report

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
  Auth.canAccessPage("tills", "exportTransactions"),
  function(req, res) {
    res.redirect(process.env.PUBLIC_ADDRESS + "/");
  }
);

router.get(
  "/:till_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "exportTransactions"),
  function(req, res) {
    Tills.getById(req.params.till_id, function(err, till) {
      if (till) {
        TillActivity.getByTillId(till.till_id, function(status) {
          till.status = status.opening;
          res.render("till/reports", {
            title: "Till Reports",
            tillActive: true,
            tillDashboardActive: true,
            tillMode: true,
            till: till,
            status: status
          });
        });
      } else {
        req.flash("error", "Till does not exist.");
        res.redirect(process.env.PUBLIC_ADDRESS + "/till/manage");
      }
    });
  }
);

module.exports = router;
