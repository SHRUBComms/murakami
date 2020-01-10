// /api/get/reports/all-time/carbon-saved

var router = require("express").Router();

var moment = require("moment");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var Carbon = Models.Carbon;
var CarbonCategories = Models.CarbonCategories;

var Helpers = require(rootDir + "/app/helper-functions/root");
var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.verifyByKey("carbonSavings"), function(req, res) {

  var startDate = moment("1970-01-01").toDate();

  if(process.env.CARBON_OFFSET_DATE){
    startDate =   moment(process.env.CARBON_OFFSET_DATE).toDate();
  }

  Carbon.getAllBetweenTwoDates(
    startDate,
    moment().toDate(),
    function(err, carbon) {
      if (err || carbon.length == 0) {
        var totalCarbon = 0;
        res.send(totalCarbon.toFixed(3));
      } else {
        CarbonCategories.getAll(function(err, carbonCategoriesRaw) {
          Helpers.calculateCarbon(carbon, carbonCategoriesRaw, function(
            totalCarbon
          ) {
            totalCarbon = Math.abs(totalCarbon * 1e-6);
            if (process.env.CARBON_OFFSET) {
              totalCarbon = totalCarbon + Number(process.env.CARBON_OFFSET);
            }
            res.send(totalCarbon.toFixed(3));
          });
        });
      }
    }
  );
});

module.exports = router;
