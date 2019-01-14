// /volunteers/roles/manage

var router = require("express").Router();

var rootDir = process.env.CWD;

var Volunteers = require(rootDir + "/app/models/volunteers");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get("/", function(req, res){
  Volunteers.getAllRoles(function(err, roles){
    res.render("volunteers/roles/manage", {
      title: "Manage Volunteer Roles",
      volunteerRolesActive: true,
      roles: roles
    })
  })
})


module.exports = router;
