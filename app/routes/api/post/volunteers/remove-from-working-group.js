// /api/post/volunteers/remove-from-working-group

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;
var Volunteers = Models.Volunteers;

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "update"),
  function(req, res) {
    var response = { msg: "Something went wrong!", status: "fail" };

    if (req.body.member_id && req.body.group_id) {
      var member_id = req.body.member_id.trim();
      var group_id = req.body.group_id.trim().toUpperCase();

      Volunteers.getVolunteerById(member_id, req.user, function(
        err,
        volunteer
      ) {
        if (volunteer) {
          if (volunteer.canUpdate) {
            var rolesToRemove = [];

            if (volunteer.old_working_groups.includes(group_id)) {
              volunteer.old_working_groups.splice(
                volunteer.old_working_groups.indexOf(group_id),
                1
              );
            }

            Members.updateWorkingGroups(
              member_id,
              volunteer.old_working_groups,
              function(err) {
                if (!err) {
                  async.eachOf(
                    volunteer.roles,
                    function(role, index, callback) {
                      if (req.user.allVolunteerRoles[role]) {
                        role = req.user.allVolunteerRoles[role];
			console.log(group_id);
			console.log(req.user.working_groups);
                        if (role.group_id == group_id || (group_id == "MY-VOLUNTEERS" && req.user.working_groups.includes(role.group_id))) {
                          rolesToRemove.push(role.role_id);
                        }
                      }
                      callback();
                    },
                    function() {
                      async.each(
                        rolesToRemove,
                        function(role_id, callback) {
                          volunteer.roles.splice(
                            volunteer.roles.indexOf(role_id)
                          );
                          callback();
                        },
                        function() {
                          Volunteers.updateRoles(
                            member_id,
                            volunteer.roles,
                            function(err) {
                              if (!err) {
                                response.status = "ok";
                                response.msg = "Volunteer removed.";
                                res.send(response);
                              } else {
                                res.send(response);
                              }
                            }
                          );
                        }
                      );
                    }
                  );
                } else {
                  res.send(response);
                }
              }
            );
          } else {
            response.msg =
              "You don't have permission to remove this volunteer.";
            res.send(response);
          }
        } else {
          response.msg = "Volunteer does not exist.";
          res.send(response);
        }
      });
    } else {
      res.send(response);
    }
  }
);

module.exports = router;
