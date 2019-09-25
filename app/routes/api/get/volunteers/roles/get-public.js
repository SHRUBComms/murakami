// /api/get/volunteers/roles/get-public
var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Models = require(rootDir + "/app/models/sequelize");
var VolunteerRoles = Models.VolunteerRoles;
var WorkingGroups = Models.WorkingGroups;

router.get("/", Auth.verifyByKey("publicVolunteerRoles"), function(req, res) {
  VolunteerRoles.findAll({
    where: { public: 1, removed: 0 },
    order: [["dateCreated", "DESC"]]
  }).nodeify(function(err, roles) {
    if (!err) {
      WorkingGroups.getAll(function(eer, allWorkingGroupsObj) {
        res.send({
          status: "ok",
          roles: roles,
          workingGroups: allWorkingGroupsObj
        });
      });
    } else {
      res.send({ status: "fail", roles: [] });
    }
  });
});

router.get("/:role_id", Auth.verifyByKey("publicVolunteerRoles"), function(
  req,
  res
) {
  VolunteerRoles.findAll({
    where: { public: 1, removed: 0, role_id: req.params.role_id }
  }).nodeify(function(err, role) {
    try {
      if (!err && role[0]) {
        WorkingGroups.getAll(function(eer, allWorkingGroupsObj) {
          res.send({
            status: "ok",
            role: role[0],
            workingGroups: allWorkingGroupsObj
          });
        });
      } else {
        res.send({ status: "fail", role: {} });
      }
    } catch (err) {
      console.log(err);
      res.send({ status: "fail", role: {} });
    }
  });
});

module.exports = router;
