// /working-groups/review-volunteer-hours

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings")
var WorkingGroups = require(rootDir + "/app/models/working-groups")

var Auth = require(rootDir + "/app/configs/auth");

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  if(req.user.admin_wg){
    var group = req.user.admin_wg[0].id;
    res.redirect("/working-groups/review-volunteer-hours/" + group);
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

        res.render('workingGroups/review-volunteer-hours', {
          title: "Review Volunteer Hours",
          workingGroupsActive: true,
          working_group: group
        });

      } else {
        res.redirect('/working-groups');
      }
    });  
  });
});

module.exports = router;