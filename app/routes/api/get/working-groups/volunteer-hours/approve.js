// /api/get/working-groups/volunteer-hours/approve

var router = require("express").Router();
var moment = require("moment");

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Tills = require(rootDir + "/app/models/tills");
var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:shift_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    var message = {
      status: "fail",
      msg: null
    };

    WorkingGroups.getShiftById(req.params.shift_id, function(err, shift) {
      if (err || !shift[0]) {
        message.status = "fail";
        message.msg = "Couldn't find that shift!";
        res.send(message);
      }

      var shift = shift[0];

      Members.getById(shift.member_id, req.user, function(err, member) {
        if (err) throw err;

        WorkingGroups.getAll(function(err, allWorkingGroups) {
          if (allWorkingGroups[shift.working_group]) {
            var group = allWorkingGroups[shift.working_group];
            WorkingGroups.approveShift(req.params.shift_id, function(err) {
              message.status = "ok";
              message.msg =
                "Shift approved - " +
                member.full_name +
                ", " +
                shift.duration_as_decimal +
                " hour(s) for " +
                group.name;

              if (
                moment(member.current_exp_membership).isBefore(
                  moment().add(3, "months")
                )
              ) {
                Members.renew(member.member_id, "3_months", function() {
                  Members.updateFreeStatus(member.member_id, 1, function() {
                    message.msg += ".<br/>Membership renewed!";
                    res.send(message);
                  });
                });
              } else {
                res.send(message);
              }
            });
          } else {
            message.status = "fail";
            message.msg = "Please select a valid group!";
            res.send(message);
          }
        });
      });
    });
  }
);

module.exports = router;
