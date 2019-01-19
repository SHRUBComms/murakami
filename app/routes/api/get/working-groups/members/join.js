// /api/get/working-groups/members/join

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:working_group/:member_id", Auth.isLoggedIn, function(req, res) {
  var message = {
    status: "fail",
    msg: null
  };
  WorkingGroups.getAll(function(err, allWorkingGroups) {
    if (allWorkingGroups[req.params.working_group]) {
      var group = allWorkingGroups[req.params.working_group];

      Members.getById(req.params.member_id, req.user, function(err, member) {
        if (err || !member) {
          message.status = "fail";
          message.msg = "Something went wrong!";
          res.send(message);
        } else {
          member = member;

          if (member.working_groups) {
            member.working_groups = JSON.parse(member.working_groups);
          } else {
            member.working_groups = [];
          }
          for (let i = 0; i < member.working_groups.length; i++) {
            if (member.working_groups[i] == req.params.working_group) {
              var found = true;
            }
          }

          if (found) {
            message.status = "fail";
            message.msg = "Already a member!";
            res.send(message);
          } else {
            if (["admin", "volunteer"].includes(req.user.class)) {
              member.working_groups.push(req.params.working_group);
              member.working_groups = JSON.stringify(
                member.working_groups.sort()
              );
              Members.updateWorkingGroups(
                req.params.member_id,
                member.working_groups,
                function(err) {
                  if (err) {
                    message.status = "fail";
                    message.msg = "Something went wrong!";
                    res.send(message);
                  }

                  var request = {};
                  WorkingGroups.createApprovedJoinRequest(
                    member.member_id,
                    group.group_id,
                    function(err) {
                      message.status = "ok";
                      message.msg = "Member added!";
                      res.send(message);
                    }
                  );
                }
              );
            } else {
              WorkingGroups.getJoinRequestByMemberId(
                member.member_id,
                group.group_id,
                function(err, requests) {
                  if (requests[0] == null) {
                    WorkingGroups.createJoinRequest(
                      member.member_id,
                      group.group_id,
                      function(err) {
                        if (err) {
                          message.status = "fail";
                          message.msg = "Something went wrong!";
                          res.send(message);
                        } else {
                          message.status = "ok";
                          message.msg = "Requested to join " + group.name + "!";
                          res.send(message);
                        }
                      }
                    );
                  } else {
                    message.status = "fail";
                    message.msg =
                      "Already requested to join " + group.name + "!";
                    res.send(message);
                  }
                }
              );
            }
          }
        }
      });
    } else {
      message.status = "fail";
      message.msg = "Group not found!";
      res.send(message);
    }
  });
});

module.exports = router;
