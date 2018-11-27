// /api/get/working-groups/members/leave

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:working_group/:member_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "volunteer"]),
  function(req, res) {
    var message = {
      status: "fail",
      msg: null
    };

    WorkingGroups.getAll(function(err, allWorkingGroups) {
      if (allWorkingGroups[req.params.working_group]) {
        Members.getById(req.params.member_id, function(err, member) {
          if (err) {
            message.status = "fail";
            message.msg = "Something went wrong!";
            res.send(message);
          } else {
            member = member[0];
            member.working_groups = JSON.parse(member.working_groups);
            for (let i=0; i < member.working_groups.length; i++) {
              if (
                member.working_groups[i] == req.params.working_group ||
                req.params.working_group ==
                  allWorkingGroups[member.working_groups[i]].parent
              ) {
                var found = true;
                member.working_groups.splice(i, 1);
              }
            }

            if (found) {
              member.working_groups = JSON.stringify(member.working_groups);
              Members.updateWorkingGroups(
                req.params.member_id,
                member.working_groups,
                function(err) {
                  if (err) {
                    message.status = "fail";
                    message.msg = "Something went wrong!";
                    res.send(message);
                  } else {
                    message.status = "ok";
                    message.msg = "Member removed!";
                    res.send(message);
                  }
                }
              );
            } else {
              message.status = "fail";
              message.msg = "Doesn't belong to this group!";
              res.send(message);
            }
          }
        });
      } else {
        message.status = "fail";
        message.msg = "Group not found!";
        res.send(message);
      }
    });
  }
);

module.exports = router;
