// /working-groups/find-a-volunteer

var router = require("express").Router();
var async = require("async");
var emailExistence = require("email-existence");

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings")
var Members = require(rootDir + "/app/models/members")
var WorkingGroups = require(rootDir + "/app/models/working-groups")

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isAdmin, function(req, res){
  Settings.getAll(function(err, settings){
    settings = settings[0];
    settings.definitions = JSON.parse(settings.definitions);
    Members.getAllVolunteerInfo(settings, function(err, volunteerInfo){

      res.render("workingGroups/find-a-volunteer", {
        title: "Find A Volunteer",
        workingGroupsActive: true,
        volunteers: volunteerInfo
      })    
    })
  });
})

module.exports = router;