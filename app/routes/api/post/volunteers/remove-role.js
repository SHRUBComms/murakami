// /api/post/volunteers/remove-role

var router = require("express").Router();

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");

var Models = require(rootDir + "/app/models/sequelize");

var Volunteers = Models.Volunteers;
var Members = Models.Members;
var VolunteerRoles = Models.VolunteerRoles;

router.post(
  "/",
  Auth.isLoggedIn,

  function(req, res) {
    var member_id = req.body.member_id;
    var role_id = req.body.role_id;
    var response = { msg: "Something went wrong!", status: "fail" };
    Volunteers.getVolunteerById(member_id, req.user, function(err, volunteer) {
      if (volunteer) {
        VolunteerRoles.getRoleById(role_id, function(err, role) {
          if (role) {
            if (volunteer.roles.indexOf(role_id) >= 0) {
              volunteer.roles.splice(volunteer.roles.indexOf(role_id), 1);
              Volunteers.updateRoles(member_id, volunteer.roles, function(err) {
                if (err) {
                  res.send(response);
                } else {
                  response.status = "ok";
                  response.msg = "Role removed!";
                  res.send(response);
                }
              });
            } else {
              response.msg = "Volunteer doesn't belong to this role.";
              res.send(response);
            }
          } else {
            response.msg = "Role does not exist.";
            res.send(response);
          }
        });
      } else {
        response.msg = "Volunteer does not exist.";
        res.send(response);
      }
    });
  }
);

module.exports = router;
