// /api/get/working-groups/join-requests/deny

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:request_id", Auth.isLoggedIn, Auth.isVolunteerOrAdmin, function(
  req,
  res
) {
  var message = {
    status: "fail",
    msg: null
  };

  WorkingGroups.getJoinRequestById(req.params.request_id, function(
    err,
    request
  ) {
    if (err) {
      message.status = "fail";
      message.msg = "Something went wrong!";
      res.send(message);
    } else {
      //TODO: sanitize
      WorkingGroups.denyJoinRequest(req.params.request_id, function(err) {
        if (err) {
          message.status = "fail";
          message.msg = "Something went wrong!";
          res.send(message);
        } else {
          message.status = "ok";
          message.msg = "Member not added!";
          res.send(message);
        }
      });
    }
  });
});

module.exports = router;
