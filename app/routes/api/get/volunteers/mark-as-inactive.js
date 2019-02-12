// /api/get/volunteers/mark-as-inactive

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Volunteers = require(rootDir + "/app/models/volunteers");

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
      Volunteers.updateActiveStatus(req.params.member_id, 0, function(err) {
        if (err) {
          res.send(response);
        } else {
          response.status = "ok";
          response.msg =
            volunteer.first_name +
            " " +
            volunteer.last_name +
            " marked as inactive!";
          res.send(response);
        }
      });
    } else {
      response.msg = "Not a volunteer!";
      res.send(response);
    }
  });
});

module.exports = router;
