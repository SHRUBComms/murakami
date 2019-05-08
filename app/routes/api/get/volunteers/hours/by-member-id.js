// /api/get/volunteers/hours/by-member-id

var router = require("express").Router();
var moment = require("moment");
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Volunteers = Models.Volunteers;
var VolunteerHours = Models.VolunteerHours;

var Tills = Models.Tills;
var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "shiftHistory"),
  function(req, res) {
    Volunteers.getVolunteerById(req.params.member_id, req.user, function(
      err,
      volunteer
    ) {
      if (volunteer) {
        if (volunteer.shiftHistory == true) {
          VolunteerHours.getByMemberId(req.params.member_id, function(
            err,
            shifts
          ) {
            if (!err && shifts) {
              var formattedShifts = [];
              async.each(
                shifts,
                function(shift, callback) {
                  var formattedShift = {};
                  formattedShift.date = moment(shift.date).format("L");
                  formattedShift.working_group =
                    req.user.allWorkingGroupsObj[shift.working_group].name ||
                    "Unknown";
                  formattedShift.duration = shift.duration_as_decimal;
                  if (shift.note && shift.note != "null") {
                    formattedShift.note = shift.note;
                  } else {
                    formattedShift.note = "-";
                  }

                  formattedShifts.push(formattedShift);
                  callback();
                },
                function() {
                  res.send(formattedShifts);
                }
              );
            } else {
              res.send([]);
            }
          });
        } else {
          res.send([]);
        }
      } else {
        res.send([]);
      }
    });
  }
);

module.exports = router;
