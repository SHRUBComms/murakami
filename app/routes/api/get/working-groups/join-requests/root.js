// /api/get/working-groups/members/join-requests

var router = require("express").Router();
var async = require("async");
var moment = require("moment");

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:group_id", Auth.isLoggedIn, Auth.isVolunteerOrAdmin, function(
  req,
  res
) {
  WorkingGroups.getById(req.params.group_id, function(err, group) {
    if (group) {
      group = group[0];
      WorkingGroups.getAllUnreviewedJoinRequests(group.group_id, function(
        err,
        joinRequests
      ) {
        formattedJoinRequests = [];
        async.eachOf(
          joinRequests,
          function(request, i, callback) {
            formattedJoinRequests[i] = {};
            Members.getById(joinRequests[i].member_id, function(err, member) {
              if (member[0]) {
                member = member[0];
                formattedJoinRequests[i].name =
                  "<a href='/members/view/" +
                  member.member_id +
                  "'>" +
                  member.first_name +
                  " " +
                  member.last_name +
                  "</a>";
                formattedJoinRequests[i].date = moment(
                  joinRequests[i].time_requested
                ).format("DD/MM/YY");
                formattedJoinRequests[i].options =
                  '<a class="btn btn-success" onclick="joinRequestsAjax(\'/api/get/working-groups/join-requests/approve/' +
                  joinRequests[i].request_id +
                  "')\">Approve</a>" +
                  '&emsp;<a class="btn btn-danger" onclick="joinRequestsAjax(\'/api/get/working-groups/join-requests/deny/' +
                  joinRequests[i].request_id +
                  "')\">Deny</a>";
              }
              callback();
            });
          },
          function(err) {
            res.send(
              formattedJoinRequests.filter(
                value => Object.keys(value).length !== 0
              )
            );
          }
        );
      });
    } else {
      res.send([]);
    }
  });
});

router.use("/approve", require("./approve"));
router.use("/deny", require("./deny"));

module.exports = router;
