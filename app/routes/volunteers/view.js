// /volunteers/view

var router = require("express").Router();

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Users = Models.Users;
var Members = Models.Members;
var Volunteers = Models.Volunteers;
var VolunteerRoles = Models.VolunteerRoles;
var FoodCollections = Models.FoodCollections;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/:member_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "view"),
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
            Users.getCoordinators(
              { permissions: { users: { name: true } } },
              function(err, coordinators, coordinatorsObj) {
                VolunteerRoles.getAll(function(
                  err,
                  roles,
                  rolesGroupedByGroup,
                  rolesGroupedById
                ) {
                  FoodCollections.getOrganisations(function(
                    err,
                    allOrganisations
                  ) {
                    res.render("volunteers/view", {
                      title: "View Volunteer",
                      volunteersActive: true,
                      member: member,
                      volInfo: volInfo,
                      coordinators: coordinatorsObj,
                      roles: rolesGroupedById,
                      allOrganisations: allOrganisations
                    });
                  });
                });
              }
            );
          } else {
            req.flash(
              "error_msg",
              "You don't have permission to view this volunteer!"
            );
            res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
          }
        });
      }
    });
  }
);

module.exports = router;
