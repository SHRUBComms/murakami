// /api/get/volunteers/hours/approve

var router = require("express").Router();
var moment = require("moment");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var VolunteerHours = Models.VolunteerHours;

var Tills = Models.Tills;
var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:shift_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteerHours", "review"),
  function(req, res) {
    var message = {
      status: "fail",
      msg: null
    };

    VolunteerHours.getShiftById(req.params.shift_id, function(err, shift) {
      if (err || !shift) {
        message.status = "fail";
        message.msg = "Couldn't find that shift!";
        res.send(message);
      } else {
        Members.getById(shift.member_id, req.user, function(err, member) {
          if (
            req.user.permissions.volunteerHours.review == true ||
            (req.user.permissions.volunteerHours.review ==
              "commonWorkingGroup" &&
              req.user.working_groups.includes(shift.working_group))
          ) {
            var group = req.user.allWorkingGroupsObj[shift.working_group];
            VolunteerHours.approveShift(req.params.shift_id, function(err) {
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
            message.msg = "You don't have permission to approve this shift!";
            res.send(message);
          }
        });
      }
    });
  }
);

module.exports = router;
