// /api/post/volunteers/remove-working-group

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Members = require(rootDir + "/app/models/members");

router.post(
  "/",
  Auth.isLoggedIn,

  function(req, res) {
    var member_id = req.body.member_id.trim();

    var group_id = req.body.group_id.trim().toUpperCase();
    var response = { msg: "Something went wrong!", status: "fail" };

    Members.getById(member_id, req.user, function(err, volunteer) {
      if (volunteer) {
        if (volunteer.working_groups.indexOf(group_id) >= 0) {
          volunteer.working_groups.splice(
            volunteer.working_groups.indexOf(group_id),
            1
          );
          Members.updateWorkingGroups(
            member_id,
            JSON.stringify(volunteer.working_groups),
            function(err) {
              if (err) {
                res.send(response);
              } else {
                response.status = "ok";
                response.msg = "Volunteer removed from group!";
                res.send(response);
              }
            }
          );
        } else {
          response.msg = "Volunteer doesn't belong to this working group.";
          res.send(response);
        }
      } else {
        response.msg = "Volunteer does not exist.";
        res.send(response);
      }
    });
  }
);

module.exports = router;
