// /till/manage

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Carbon = require(rootDir + "/app/models/carbon-calculations");
var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:till_id", Auth.isLoggedIn, function(req, res) {
  Tills.getTillById(req.params.till_id, function(err, till) {
    if (till) {
      Tills.getStatusById(till.till_id, function(status) {
        Tills.getCategoriesByTillId(req.params.till_id, "tree", function(
          err,
          categories
        ) {
          var till_id = req.query.till_id || null;
          var tillMode = false;
          if (till_id) {
            tillMode = true;
          }
          Carbon.getCategories(function(err, carbonCategories) {
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
        });
      });
    } else {
      req.flash("error", "Till not found.");
      res.redirect(process.env.PUBLIC_ADDRESS + "/till/manage");
    }
  });
});

module.exports = router;
