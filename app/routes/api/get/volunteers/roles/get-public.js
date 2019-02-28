// /api/get/volunteers/roles/get-public_address
var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var VolunteerRoles = require(rootDir + "/app/models/volunteer-roles");

router.get("/", Auth.isLoggedIn, function(req, res) {
  VolunteerRoles.getAllPublicRoles(function(err, roles) {
    res.send(roles);
  });
});

module.exports = router;
