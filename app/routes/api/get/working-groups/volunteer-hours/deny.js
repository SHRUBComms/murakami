// /api/get/working-groups/volunteer-hours/deny

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

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
      if (err) throw err;
      var shift = shift[0];

      if (shift.approved !== null) {
        message.status = "ok";
        message.msg = "Shift has already been approved!";
        res.send(message);
      } else {
        WorkingGroups.getAll(function(err, allWorkingGroups) {
          if (allWorkingGroups[shift.working_group]) {
            Members.getById(shift.member_id, req.user, function(err, member) {
              if (err) throw err;

              WorkingGroups.denyShift(req.params.shift_id, function(err) {
                if (err) throw err;

                message.status = "ok";
                message.msg = "Shift rejected!";
                res.send(message);
              });
            });
          } else {
            message.status = "fail";
            message.msg = "Invalid group!";
            res.send(message);
          }
        });
      }
    });
  }
);

module.exports = router;
