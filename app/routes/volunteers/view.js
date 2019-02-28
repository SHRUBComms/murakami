// /volunteers/view

var router = require("express").Router();

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var Members = require(rootDir + "/app/models/members");
var Volunteers = require(rootDir + "/app/models/volunteers");
var VolunteerRoles = require(rootDir + "/app/models/volunteer-roles");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    Members.getById(req.params.member_id, req.user, function(err, member) {
      if (err || !member) {
        req.flash("error_msg", "Member not found!");
        res.redirect(process.env.PUBLIC_ADDRESS + "/members/manage");
      } else {
        Volunteers.getVolunteerById(req.params.member_id, req.user, function(
          err,
          volInfo
        ) {
          if (volInfo) {
            if (
              Helpers.hasOneInCommon(volInfo.assignedCoordinators, [
                req.user.id
              ]) ||
              Helpers.hasOneInCommon(
                member.working_groups,
                req.user.working_groups_arr
              ) ||
              req.user.class == "admin"
            ) {
              Users.getCoordinators({ class: "admin" }, function(
                err,
                coordinators,
                coordinatorsObj
              ) {
                VolunteerRoles.getAll(function(
                  err,
                  roles,
                  rolesGroupedByGroup,
                  rolesGroupedById
                ) {
                  res.render("volunteers/view", {
                    title: "View Volunteer",
                    volunteersActive: true,
                    member: member,
                    volInfo: volInfo,
                    coordinators: coordinatorsObj,
                    roles: rolesGroupedById
                  });
                });
              });
            } else {
              req.flash(
                "error_msg",
                "You don't have permission to view this volunteer!"
              );
              res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
            }
          } else {
            req.flash("error_msg", "Member is not a volunteer!");
            res.redirect(
              process.env.PUBLIC_ADDRESS +
                "/members/make-volunteer/" +
                member.member_id
            );
          }
        });
      }
    });
  }
);

module.exports = router;
// /volunteers/view
