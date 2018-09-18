// /api/get/working-groups/members/join-requests

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/:group_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
      if(group){
        WorkingGroups.getAllUnreviewedJoinRequests(req.params.group_id, function(err, joinRequests){
          if(err) throw err;

          formattedJoinRequests = [];
          async.eachOf(joinRequests, function(request, i, callback){
            WorkingGroups.makeJoinRequestNice(joinRequests[i], function(niceRequest){
              formattedJoinRequests[i] = {};
              formattedJoinRequests[i].name = "<a href='/members/view/" + niceRequest.member_id + "'>" + niceRequest.name + "</a>";
              formattedJoinRequests[i].date = niceRequest.date;
              formattedJoinRequests[i].options = '<a class="btn btn-success" onclick="joinRequestsAjax(\'/api/get/working-groups/join-requests/approve/' + niceRequest.id + '\')">Approve</a>' +
              '&emsp;<a class="btn btn-danger" onclick="joinRequestsAjax(\'/api/get/working-groups/join-requests/deny/' + niceRequest.id + '\')">Deny</a>';

              callback();
            });

          }, function (err) {

            res.send(formattedJoinRequests);
          });

        });
      } else {
        res.send("Invalid group!");
      }
    });
  });
});

router.use("/approve", require("./approve"));
router.use("/deny", require("./deny"));

module.exports = router;