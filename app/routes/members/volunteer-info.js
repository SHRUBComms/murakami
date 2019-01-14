// /members/volunteer-info

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:member_id", Auth.isLoggedIn, Auth.isOfClass(["admin", "volunteer"]), function(
  req,
  res
) {
  Members.getById(req.params.member_id, function(err, member) {
    if (member[0] && !err) {
      Members.getVolInfoById(req.params.member_id, function(err, volInfo) {
        WorkingGroups.getAll(function(err, allWorkingGroups) {
          if (volInfo[0] && !err) {
            volInfo = volInfo[0];
            volInfo.lastUpdated = new Date(volInfo.lastUpdated);
            volInfo.lastUpdated =
              volInfo.lastUpdated.getDate() +
              "/" +
              (volInfo.lastUpdated.getMonth() + 1) +
              "/" +
              volInfo.lastUpdated.getFullYear();
            volInfo.availability = JSON.parse(volInfo.availability);
            volInfo.survey = JSON.parse(volInfo.survey);
            volInfo.roles = JSON.parse(volInfo.roles);
            volInfo.formattedRoles = [];

            async.each(
              volInfo.roles,
              function(role, callback) {
                if (allWorkingGroups[role.wg_id]) {
                  let formattedRole = {};
                  formattedRole.wg_id = allWorkingGroups[role.wg_id].group_id;
                  formattedRole.wg_name = allWorkingGroups[role.wg_id].name;
                  formattedRole.name = role.name;
                  callback(formattedRole);
                }
              },
              function(formattedRole) {
                if (formattedRole) {
                  volInfo.formattedRoles.push(formattedRole);
                }
              }
            );
          }

          volInfo.roles = volInfo.formattedRoles;

          res.render("members/volunteer-info", {
            member: member[0],
            volunteersActive: true,
            title: "Volunteer Info",
            volInfo: volInfo,
            allWorkingGroups: allWorkingGroups
          });
        });
      });
    } else {
      req.flash("error", "Member not found!");
      res.redirect("/members");
    }
  });
});

router.post("/:member_id", Auth.isLoggedIn, Auth.isOfClass(["admin", "volunteer"]), function(
  req,
  res
) {
  Members.getById(req.params.member_id, function(err, member) {
    if (member[0] && !err) {
      WorkingGroups.getAll(function(err, allWorkingGroups) {
        var volInfo = req.body.volInfo;


        var errors = req.validationErrors();

        volInfo.formattedRoles = [];

        if (req.body.volInfo.roles) {
          var working_groups = JSON.parse(member[0].working_groups).reduce(
            function(obj, v) {
              obj[v] = true;
              return obj;
            },
            {}
          );
          volInfo.roles = JSON.parse(req.body.volInfo.roles);

          async.each(
            volInfo.roles,
            function(role, callback) {
              if (role.wg_id && role.name) {
                if (allWorkingGroups[role.wg_id]) {
                  let formattedRole = {};
                  formattedRole.wg_id = allWorkingGroups[role.wg_id].group_id;
                  formattedRole.name = role.name;
                  working_groups[allWorkingGroups[role.wg_id].group_id] = true;
                  callback(role);
                }
              } else {
                callback(null);
              }
            },
            function(formattedRole) {
              if (formattedRole) {
                volInfo.formattedRoles.push(formattedRole);
              }
            }
          );
        }

        if (!errors && volInfo.formattedRoles.length == 0) {
          let error = {
            param: "roles",
            msg: "Please select at least one valid role",
            value: req.body.volInfo.roles
          };
          errors = [];
          errors.push(error);
        }



        if (errors) {
          res.render("volunteers/add", {
            errors: errors,
            volunteersActive: true,
            title: "Add Volunteer",
            roles: roles,
            volInfo: volInfo
          });
        } else {
          if (!volInfo.survey.skills.other) {
            delete volInfo.survey.skills.other;
          }

          volInfo.member_id = req.params.member_id;
          volInfo.roles = volInfo.formattedRoles;

          volInfo.availability = JSON.stringify(volInfo.availability);
          volInfo.survey = JSON.stringify(volInfo.survey);
          volInfo.roles = JSON.stringify(volInfo.roles);

          Members.putVolInfo(volInfo, function(err) {
            if (err) {
              req.flash("error", "Something went wrong!");
              res.render("members/volunteer-info", {
                volunteersActive: true,
                title: "Volunteer Info",
                allWorkingGroups: allWorkingGroups,
                volInfo: volInfo,
                member: member[0]
              });
            } else {
              Members.updateWorkingGroups(
                member[0].member_id,
                JSON.stringify(Object.keys(working_groups)),
                function(err) {}
              );
              req.flash("success_msg", "Volunteer info updated!");
              res.redirect("/members/volunteer-info/" + req.params.member_id);
            }
          });
        }
      });
    } else {
      req.flash("error", "Member not found!");
      res.redirect("/members");
    }
  });
});

module.exports = router;
