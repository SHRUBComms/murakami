// /api/get/volunteers/hours/deny

var router = require("express").Router();

var rootDir = process.env.CWD;

var VolunteerHours = require(rootDir + "/app/models/volunteer-hours");

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

    VolunteerHours.getShiftById(req.params.shift_id, function(err, shift) {
      if (err) throw err;
      var shift = shift[0];

      if (shift.approved !== null) {
        message.status = "ok";
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
    });
  }
);

module.exports = router;
