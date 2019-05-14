// /api/get/reports/today/carbon-saved

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Carbon = Models.Carbon;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.get("/", Auth.isLoggedIn, function(req, res) {
  Carbon.getToday(function(err, carbon) {
    if (err || carbon.length == 0) {
      var totalCarbon = 0;
      res.send(totalCarbon.toFixed(3));
    } else {
      CarbonCategories.getAll(function(err, carbonCategoriesRaw) {
        Helpers.calculateCarbon(carbon, carbonCategoriesRaw, function(
          totalCarbon
        ) {
          res.send(Math.abs(totalCarbon).toFixed(3));
        });
      });
    }
  });
});

module.exports = router;
