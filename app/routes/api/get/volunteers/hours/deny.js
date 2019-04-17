// /api/get/volunteers/hours/deny

var router = require("express").Router();

var rootDir = process.env.CWD;

var VolunteerHours = require(rootDir + "/app/models/volunteer-hours");

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
      shift = shift[0];
      if (
        req.user.permissions.volunteerHours.review == true ||
        (req.user.permissions.volunteerHours.review == "commonWorkingGroup" &&
          req.user.working_groups.includes(shift.working_group))
      ) {
        if (shift.approved !== null) {
          message.status = "fail";
          message.msg = "Shift has already been reviewed!";
          res.send(message);
        } else {
          VolunteerHours.denyShift(req.params.shift_id, function(err) {
            if (err) throw err;

            message.status = "ok";
            message.msg = "Shift rejected!";
            res.send(message);
          });
        }
      } else {
        message.status = "fail";
        message.msg = "You don't have permission to deny this shift!";
        res.send(message);
      }
    });
  }
);

module.exports = router;
