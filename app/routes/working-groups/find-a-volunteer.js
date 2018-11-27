// /working-groups/find-a-volunteer

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin", "volunteer"]), function(req, res) {
  var availability = req.query.availability || {};
  Members.getVolunteerInfoByGroupId(req.query.group_id, function(
    err,
    volunteers
  ) {
    async.eachOf(
      volunteers,
      function(volunteer, i, callback) {
        var found = true;
        Object.keys(availability).forEach(function(key, value) {
          if (!volunteer.availability[key]) {
            found = false;
          }
        });
        if (found == false) {
          volunteers[i] = {};
        }

        callback();
      },
      function() {
        volunteers = volunteers.filter(
          value => Object.keys(value).length !== 0
        );
        res.render("workingGroups/find-a-volunteer", {
          title: "Find A Volunteer",
          volunteersActive: true,
          volunteers: volunteers,
          availability: availability,
          group_id: req.query.group_id
        });
      }
    );
  });
});

module.exports = router;
