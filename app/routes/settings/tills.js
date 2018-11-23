// /setting/tills

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Carbon = require(rootDir + "/app/models/carbon-calculations");
var Tills = require(rootDir + "/app/models/tills");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  Tills.getAllTills(function(err, tills) {
    async.each(
      tills,
      function(till, callback) {
        Tills.getStatusById(till.till_id, function(status) {
          till.status = status;
          callback();
        });
      },
      function() {
        res.render("settings/tills/root", {
          title: "Manage Tills",
          tillsActive: true,
          tills: tills
        });
      }
    );
  });
});

router.get("/:till_id", Auth.isLoggedIn, function(req, res) {
  Tills.getTillById(req.params.till_id, function(err, till) {
    if (till) {
      Tills.getStatusById(till.till_id, function(status) {
        Tills.getCategoriesByTillId(req.params.till_id, "tree", function(
          err,
          categories
        ) {
          var layout;
          if (req.user.admin == 1) {
            layout = "layout";
          } else {
            layout = "till";
          }
          Carbon.getCategories(function(err, carbonCategories) {
            res.render("settings/tills/view", {
              layout: layout,
              title: till.name,
              tillsActive: true,
              till: till,
              categories: categories,
              carbonCategories: carbonCategories,
              status: status
            });
          });
        });
      });
    } else {
      req.flash("error", "Till not found.");
      res.redirect("/settings/tills");
    }
  });
});

module.exports = router;
