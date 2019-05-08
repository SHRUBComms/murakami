// /api/get/volunteers/roles/get-public
var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Models = require(rootDir + "/app/models/sequelize");
var VolunteerRoles = Models.VolunteerRoles;

router.get("/", Auth.isLoggedIn, function(req, res) {
  VolunteerRoles.getAllPublicRoles(function(err, roles) {
    res.send(roles);
  });
});

module.exports = router;
