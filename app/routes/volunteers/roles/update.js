// /volunteers/roles/view

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Volunteers = require(rootDir + "/app/models/volunteers");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");


var allLocations = ["At home", "22 Bread Street", "17 Guthrie Street", "13 Guthrie Street", "Out and about in Edinburgh"];
var allActivities = [
  "Administration/office work",
  "Events",
  "Adults",
  "Advice/Information giving",
  "Families",
  "Finance/Accounting",
  "Advocacy/Human Rights",
  "Health and social care",
  "Animals	Heritage",
  "Art and culture: music, drama, crafts, galleries and museums",
  "Homeless and housing",
  "Befriending/Mentoring",
  "Kitchen/Catering",
  "Campaigning/Lobbying",
  "Languages/translating",
  "Care/Support work",
  "LGBT+",
  "Charity shops/Retail",
  "Management/Business",
  "Children",
  "Mental health",
  "Community",
  "Library/Information Management",
  "Computing/Technical",
  "Marketing/PR/Media",
  "Counselling",
  "Politics",
  "Disability",
  "Practical/DIY",
  "Education",
  "Research and policy work",
  "Domestic violence",
  "Sport and recreation",
  "Drugs and addiction",
  "Students'Association",
  "Elderly",
  "Wheelchair accessible",
  "Driving/escorting",
  "Trustee and committee roles",
  "Environment/conservation/outdoors",
  "Tutoring",
  "Equality and Diversity",
  "Youth work"
];
var commitmentLengths = ["Fixed term", "Ongoing", "One off", "Christmas", "Summer"];


router.get("/:role_id", function(req, res){
  Volunteers.getRoleById(req.params.role_id, function(err, role){
    if(role){
      role.details.role_id = role.role_id;
      res.render("volunteers/roles/update", {
        title: "Update Volunter Role",
        volunteerRolesActive: true,
        role: role.details,
        locations: allLocations,
        commitmentLengths: commitmentLengths,
        activities: allActivities
      })
    } else {
      res.redirect(process.enc.PUBLIC_ADDRESS + "/volunteers/roles/manage");
    }
  })
})

router.post("/:role_id", function(req, res){
  Volunteers.getRoleById(req.params.role_id, function(err, roleExists){
    if(roleExists){

      var role = {};
      var public = req.body.public;

      // Validate role.
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
      req.checkBody("role_title", "Please enter a title for this role.").notEmpty();
      req
        .checkBody(
          "role_title",
          "Please enter a shorter role title (<= 50 characters)"
        )
        .isLength({ max: 50 });

      req.checkBody("short_description", "Please enter a short description for this role.").notEmpty();
      req
        .checkBody(
          "short_description",
          "Please enter a shorter description for this role (<= 150 characters)"
        )
        .isLength({ max: 150 });

      req.checkBody("experience_required", "Please enter the experience required for this role.").notEmpty();
      req
        .checkBody(
          "experience_required",
          "Please enter a shorter description of the experience required for this role (<= 150 characters)"
        )
        .isLength({ max: 150 });

      req.checkBody("experience_gained", "Please enter the experience gained for this role.").notEmpty();
      req
        .checkBody(
          "experience_gained",
          "Please enter a shorter description of the experience gained for this role (<= 150 characters)"
        )
        .isLength({ max: 150 });

      req.checkBody("hours_per_week", "Please enter the hours per week requried for this role.").notEmpty();

      req.checkBody("commitment_length", "Please enter the commitment length for this role.").notEmpty();
      req
        .checkBody(
          "commitment_length",
          "Please enter a valid commitment length."
        )
        .isIn(commitmentLengths);

      var working_groups = req.user.allWorkingGroupsObj;

      var errors = req.validationErrors();
      if(errors){
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

        if(role.hours_per_week < 1 || role.hours_per_week > 15){
          var error = {
            param: "working_group",
            msg: "Please enter a valid number of hours per week (>=1 and <=15)",
            value: req.body.hours_per_week
          };
          errors = [error];
        }

        if(role.working_group){
          if(!working_groups[role.working_group]){
            var error = {
              param: "working_group",
              msg: "Please select a valid working group.",
              value: req.body.working_group
            };
            errors = [error];
          }
        }

        if(Helpers.allBelongTo(role.locations, allLocations) == false){
          var error = {
            param: "locations",
            msg: "Please make sure you have selected valid locations.",
            value: req.body.locations
          };
          errors = [error];
        }

        if(Helpers.allBelongTo(role.activities, allActivities) == false){
          var error = {
            param: "activities",
            msg: "Please make sure you have selected valid activities.",
            value: req.body.activities
          };
          errors = [error];
        }

        if(errors){
          res.render("volunteers/roles/update", {
            title: "Update Volunteer Role",
            volunteerRolesActive: true,
            errors: errors,
            locations: allLocations,
            activities: allActivities,
            commitmentLengths: commitmentLengths,
            role: role
          });
        } else {
          Volunteers.updateRole(req.params.role_id, role, function(err, role_id){
            if(err){
              req.flash("error_msg", "Something went wrong!");
            } else {
              req.flash("success_msg", "Role updated!");
            }
            res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/roles/view/" + req.params.role_id);
          })
        }

      }


    } else {
      req.flash("error_msg", "Role does not exist!");
      res.redirect(process.enc.PUBLIC_ADDRESS + "/volunteers/roles/manage");
    }
  })
})


module.exports = router;
