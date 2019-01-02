// volunteers/manage

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin", "staff", "volunteer"]), function(req, res){
  if(req.user.working_groups){
    if(req.user.working_groups.length > 0){
      res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage/" + req.user.working_groups[0].group_id);
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
})

router.get("/:group_id", Auth.isLoggedIn, Auth.isOfClass(["admin", "staff", "volunteer"]), function(req, res){
  Members.getVolunteerInfoByGroupId(req.params.group_id, function(err, volunteers){
    if(req.user.class == "admin"){
      WorkingGroups.getAll(function(err, allWorkingGroups){
        res.render("volunteers/manage", {
          title: "Manage Volunteers",
          volunteers: volunteers,
          allWorkingGroups: allWorkingGroups
        })
      })
    } else {
      // Censor info according to class.
      res.render("volunteers/manage", {
        title: "Manage Volunteers",
        volunteers: volunteers
      })
    }
  })
})

module.exports = router;
