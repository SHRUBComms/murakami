// /api/get/volunteers/mark-as-active

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Volunteers = require(rootDir + "/app/models/volunteers");
var Members = require(rootDir + "/app/models/members");

router.get("/:member_id", Auth.isLoggedIn, function(req, res) {
  var response = {
    status: "fail",
    msg: "Something went wrong!"
  };
  Volunteers.getVolunteerById(req.params.member_id, req.user, function(
    err,
    volunteer
  ) {
    if (volunteer) {
      Volunteers.updateActiveStatus(req.params.member_id, 1, function(err) {
        if (err) {
          res.send(response);
        } else {
          response.status = "ok";
          response.msg =
            volunteer.first_name +
            " " +
            volunteer.last_name +
            " marked as active! ";
          Members.renew(req.params.member_id, "3_months", function(err) {
            if (err) {
              response.status = "fail";
              response.msg += "Something went wrong renewing membership.";
              res.send(response);
            } else {
              response.msg += "Membership renewed.";
              res.send(response);
            }
          });
        }
      });
    } else {
      response.msg = "Not a volunteer!";
      res.send(response);
    }
  });
});

module.exports = router;
