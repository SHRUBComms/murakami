// /api/get/volunteers/roles/get-public
var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Models = require(rootDir + "/app/models/sequelize");
var VolunteerRoles = Models.VolunteerRoles;

router.get("/", Auth.verifyByKey, function(req, res) {
  VolunteerRoles.findAll({ where: { public: 1, removed: 0 } }).nodeify(function(
    err,
    roles
  ) {
    if (!err) {
      res.send({ status: "ok", roles: roles });
    } else {
      res.send({ status: "fail", roles: [] });
    }
  });
});

module.exports = router;
