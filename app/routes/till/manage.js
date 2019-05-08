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

router.get(
  "/:till_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("tills", "viewTill"),
  function(req, res) {
    Tills.getById(req.params.till_id, function(err, till) {
      if (till) {
        if (
          req.user.permissions.tills.viewTill == true ||
          (req.user.permissions.tills.viewTill == "commonWorkingGroup" &&
            req.user.working_groups.includes(till.group_id))
        ) {
          TillActivity.getByTillId(till.till_id, function(status) {
            StockCategories.getCategoriesByTillId(
              req.params.till_id,
              "tree",
              function(err, categories) {
                var till_id = req.query.till_id || null;
                var tillMode = false;
                if (till_id) {
                  tillMode = true;
                }
                CarbonCategories.getAll(function(err, carbonCategories) {
                  res.render("till/view", {
                    tillMode: true,
                    title: "View Till",
                    tillsActive: true,
                    till: till,
                    categories: categories,
                    carbonCategories: carbonCategories,
                    status: status,
                    endDate: req.query.endDate || null,
                    startDate: req.query.startDate || null
                  });
                });
              }
            );
          });
        }
      } else {
        req.flash("error", "Till not found.");
        res.redirect(process.env.PUBLIC_ADDRESS + "/till/manage");
      }
    });
  }
);

module.exports = router;
