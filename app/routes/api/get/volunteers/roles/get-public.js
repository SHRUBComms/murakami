// /api/get/volunteers/roles/get-public_address
var router = require("express").Router();

var rootDir = process.env.CWD;

var Volunteers = require(rootDir + "/app/models/volunteers");

router.get("/", Auth.isLoggedIn, function(req, res) {
  Volunteers.getAllPublicRoles(function(err, roles) {
    res.send(roles);
  });
});

module.exports = router;
