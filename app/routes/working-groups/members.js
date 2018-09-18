// /working-groups/members

var router = require("express").Router();

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings")
var WorkingGroups = require(rootDir + "/app/models/working-groups")

var Auth = require(rootDir + "/app/configs/auth");

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  if(req.user.admin_wg){
    var group = req.user.admin_wg[0].id;
    res.redirect("/working-groups/members/" + group);
  } else {
    req.flash("error", "You're not an admin of any working groups!");
    res.redirect("/");
  }
});

router.get('/:group_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
      if(group){


          res.render('workingGroups/view-members', {
            title: "View Working Group Members",
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