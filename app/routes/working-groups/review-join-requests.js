// /working-groups/review-join-requests

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings")
var WorkingGroups = require(rootDir + "/app/models/working-groups")

var Auth = require(rootDir + "/app/configs/auth");

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  if(req.user.admin_wg){
    var group = req.user.admin_wg[0].id;
    res.redirect("/working-groups/review-join-requests/" + group);
  } else {
    res.redirect("/error");
  }
});

router.get('/:group_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
      if(group){
        WorkingGroups.getAllUnreviewedJoinRequests(req.params.group_id, function(err, joinRequests){
          if(err) throw err;
          async.eachOf(joinRequests, function(request, i, callback){
            WorkingGroups.makeJoinRequestNice(joinRequests[i], function(request){
              joinRequests[i] = request;
              callback();
            });
          }, function(err) {
              res.render('workingGroups/review-join-requests', {
                title: "Review Join Requests",
                workingGroupsActive: true,
                working_group: group,
                joinRequests: joinRequests
              });
          });

        });
      } else {
        res.redirect('/working-groups');
      }
    });  
  });
});

module.exports = router;