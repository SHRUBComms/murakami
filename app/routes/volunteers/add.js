// volunteers/add

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var Users = require(rootDir + "/app/models/users");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    Users.getCoordinators(req.user, function(err, coordinators) {
      res.render("volunteers/add", {
        title: "Add Volunteer",
        volunteersActive: true,
        coordinators: coordinators,
        roles: {
          "WG-100": [{ name: "Shop Assistant" }, { name: "Clothing Sorter" }]
        },
        skills: [
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
          "Campaigning/Lobbying	",
          "Languages/translating",
          "Care/Support work",
          "LGBT+",
          "Charity shops/Retail	",
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
        ]
      });
    });
  }
);

module.exports = router;
