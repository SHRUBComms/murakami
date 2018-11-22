// /api/get/reports/this-month/hours-volunteered

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

router.get("/", function(req, res) {
  WorkingGroups.getHoursThisMonth(function(err, hours) {
    if (hours[0]["SUM(duration_as_decimal)"]) {
      res.send(hours[0]["SUM(duration_as_decimal)"].toString());
    } else {
      res.send("0");
    }
  });
});

module.exports = router;
