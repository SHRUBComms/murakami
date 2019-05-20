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
      if (tills.length > 1) {
        res.render("till/root", {
          tillMode: true,
          title: "Select A Till",
          tills: tills
        });
      } else {
        res.redirect(
          process.env.PUBLIC_ADDRESS + "/till/transactions/" + tills[0].till_id
        );
      }
    });
  }
);

module.exports = router;
