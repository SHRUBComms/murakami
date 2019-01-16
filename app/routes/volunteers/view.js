// /volunteers/view

var router = require("express").Router();

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var Members = require(rootDir + "/app/models/members");
var Volunteers = require(rootDir + "/app/models/volunteers");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    Members.getById(req.params.member_id, req.user, function(err, member) {
      if (err || !member) {
        req.flash("error_msg", "Member not found!");
        res.redirect(process.env.PUBLIC_ADDRESS + "/members");
      } else {
        Volunteers.getVolunteerById(req.params.member_id, function(
          err,
          volInfo
        ) {
          if (volInfo) {
            Users.getCoordinators({ class: "admin" }, function(
              err,
              coordinators,
              coordinatorsObj
            ) {
              Volunteers.getAllRoles(function(
                err,
                roles,
                rolesGroupedByGroup,
                rolesGroupedById
              ) {
                console.log(volInfo.assignedCoordinators);
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
