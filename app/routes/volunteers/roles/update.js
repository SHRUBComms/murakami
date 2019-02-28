// /volunteers/roles/view

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var VolunteerRoles = require(rootDir + "/app/models/volunteer-roles");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/:role_id",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff"]),
  function(req, res) {
    VolunteerRoles.getRoleById(req.params.role_id, function(err, role) {
      if (role) {
        role.details.role_id = role.role_id;
        role.details.working_group = role.group_id;
        if (!Array.isArray(role.details.activities)) {
          role.details.activities = [role.details.activities];
        }
        if (!Array.isArray(role.details.locations)) {
          role.details.locations = [role.details.locations];
        }

        VolunteerRoles.getRoleSignUpInfo(function(
          allLocations,
          allActivities,
          commitmentLengths
        ) {
          res.render("volunteers/roles/update", {
            title: "Update Volunter Role",
            volunteerRolesActive: true,
            role: role.details,
            availability: role.availability,
            locations: allLocations,
            commitmentLengths: commitmentLengths,
            activities: allActivities
          });
        });
      } else {
        res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/manage");
      }
    });
  }
);

router.post("/:role_id", function(req, res) {
  VolunteerRoles.getRoleById(req.params.role_id, function(err, roleExists) {
    if (roleExists) {
      VolunteerRoles.getRoleSignUpInfo(function(
        allLocations,
        allActivities,
        commitmentLengths
      ) {
        var role = {};
        var public = req.body.public;

        // Validate role.
        role.role_id = req.params.role_id;
        role.title = req.body.role_title.trim();
        role.short_description = req.body.short_description.trim();
        role.experience_required = req.body.experience_required.trim();
        role.experience_gained = req.body.experience_gained.trim();
        role.hours_per_week = req.body.hours_per_week;
        role.commitment_length = req.body.commitment_length;
        role.locations = req.body.locations;
        role.activities = req.body.activities;
        role.availability = req.body.availability;
        role.working_group = req.body.working_group;

        // Validation
        req
          .checkBody("role_title", "Please enter a title for this role.")
          .notEmpty();
        req
          .checkBody(
            "role_title",
            "Please enter a shorter role title (<= 50 characters)"
          )
          .isLength({ max: 50 });

        req
          .checkBody(
            "short_description",
            "Please enter a short description for this role."
          )
          .notEmpty();
        req
          .checkBody(
            "short_description",
            "Please enter a shorter description for this role (<= 150 characters)"
          )
          .isLength({ max: 310 });

        req
          .checkBody(
            "experience_required",
            "Please enter the experience required for this role."
          )
          .notEmpty();
        req
          .checkBody(
            "experience_required",
            "Please enter a shorter description of the experience required for this role (<= 150 characters)"
          )
          .isLength({ max: 310 });

        req
          .checkBody(
            "experience_gained",
            "Please enter the experience gained for this role."
          )
          .notEmpty();
        req
          .checkBody(
            "experience_gained",
            "Please enter a shorter description of the experience gained for this role (<= 150 characters)"
          )
          .isLength({ max: 500 });

        req
          .checkBody(
            "hours_per_week",
            "Please enter the hours per week requried for this role."
          )
          .notEmpty();

        req
          .checkBody(
            "commitment_length",
            "Please enter the commitment length for this role."
          )
          .notEmpty();

        var working_groups = req.user.allWorkingGroupsObj;

        var errors = req.validationErrors() || [];
        if (errors[0]) {
          res.render("volunteers/roles/update", {
            title: "Update Volunteer Role",
            volunteerRolesActive: true,
            errors: errors,
            role: role,
            locations: allLocations,
            activities: allActivities,
            commitmentLengths: commitmentLengths
          });
        } else {
          var days = {
            mon: true,
            tue: true,
            wed: true,
            thu: true,
            fri: true,
            sat: true,
            sun: true
          };
          var periods = { m: true, a: true, e: true };

          var validTimes = 0;

          if (role.availability) {
            Object.keys(role.availability).forEach(function(key) {
              var validDay = false;
              var validPeriod = false;

              if (days[key.substring(0, 3)]) {
                validDay = true;
              }

              if (periods[key.substring(4, 5)]) {
                validPeriod = true;
              }

              if (validDay && key.substring(3, 4) == "_" && validPeriod) {
                validTimes++;
              } else {
                delete role.availability[key];
              }
            });
          }

          if (validTimes == 0) {
            let error = {
              param: "volInfo.availability",
              msg: "Please tick at least one box in the availability matrix",
              value: role.availability
            };
            errors.push(error);
          }

          if (role.hours_per_week < 1 || role.hours_per_week > 15) {
            var error = {
              param: "working_group",
              msg:
                "Please enter a valid number of hours per week (>=1 and <=15)",
              value: req.body.hours_per_week
            };
            errors = [error];
          }

          if (role.working_group) {
            if (!working_groups[role.working_group]) {
              var error = {
                param: "working_group",
                msg: "Please select a valid working group.",
                value: req.body.working_group
              };
              errors = [error];
            }
          }

          if (
            !Object.keys(commitmentLengths).includes(role.commitment_length)
          ) {
            var error = {
              param: "commitment_length",
              msg: "Please enter a valid commitment length.",
              value: req.body.locations
            };
            errors = [error];
          }

          if (
            Helpers.allBelongTo(role.locations, Object.keys(allLocations)) ==
            false
          ) {
            var error = {
              param: "locations",
              msg: "Please make sure you have selected valid locations.",
              value: req.body.locations
            };
            errors = [error];
          }

          if (
            Helpers.allBelongTo(role.activities, Object.keys(allActivities)) ==
            false
          ) {
            var error = {
              param: "activities",
              msg: "Please make sure you have selected valid activities.",
              value: req.body.activities
            };
            errors = [error];
          }

          if (errors[0]) {
            res.render("volunteers/roles/update", {
              title: "Update Volunteer Role",
              volunteerRolesActive: true,
              errors: errors,
              locations: allLocations,
              activities: allActivities,
              commitmentLengths: commitmentLengths,
              role: role,
              availability: availability
            });
          } else {
            VolunteerRoles.updateRole(req.params.role_id, role, function(
              err,
              role_id
            ) {
              if (err) {
                req.flash("error_msg", "Something went wrong!");
              } else {
                req.flash("success_msg", "Role updated!");
              }
              res.redirect(
                process.env.PUBLIC_ADDRESS +
                  "/volunteers/roles/view/" +
                  req.params.role_id
              );
            });
          }
        }
      });
    } else {
      req.flash("error_msg", "Role does not exist!");
      res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/manage");
    }
  });
});

module.exports = router;
