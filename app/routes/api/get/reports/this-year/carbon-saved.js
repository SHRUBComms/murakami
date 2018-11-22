// /api/get/reports/this-year/carbon-saved

var router = require("express").Router();

var rootDir = process.env.CWD;

var Carbon = require(rootDir + "/app/models/carbon-calculations");

var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get("/", function(req, res) {
  Carbon.getAllThisYear(function(err, carbon) {
    if (err || carbon.length == 0) {
      var totalCarbon = 0;
      res.send(totalCarbon.toFixed(3));
    } else {
      Carbon.getCategories(function(err, carbonCategoriesRaw) {
        Helpers.calculateCarbon(carbon, carbonCategoriesRaw, function(
          totalCarbon
        ) {
          console.log(totalCarbon, " kilos");
          res.send(Math.abs(totalCarbon * 1e-3).toFixed(3));
        });
      });
    }
  });
});

module.exports = router;
