// volunteers/export-hours

var router = require("express").Router();
var async = require("async");
var moment = require("moment");

moment.locale("en-gb");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var Users = require(rootDir + "/app/models/users");
var Volunteers = require(rootDir + "/app/models/volunteers");

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin", "staff"]), function(
  req,
  res
) {
  Volunteers.getHoursBetweenTwoDatesByWorkingGroup(
    req.query.group_id,
    req.query.startDate,
    req.query.endDate,
    function(err, shifts) {
      res.render("volunteers/hours/export", {
        volunteerHoursActive: true,
        title: "Export Data",
        group: {
          group_id: req.query.group_id || null
        },
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
        shifts: shifts
      });
    }
  );
});

module.exports = router;
