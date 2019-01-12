// volunteers/manage

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/configs/helpful_functions");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.isOfClass(["admin", "staff", "volunteer"]),
  function(req, res) {
    Members.getVolunteersByGroupId(
      req.query.group_id || null,
      req.user,
      function(err, volunteers) {
        userBelongsToGroup = Helpers.hasOneInCommon(
          req.user.working_groups_arr,
          [req.query.group_id]
        );

        if (
          (req.query.group_id && userBelongsToGroup) ||
          !req.query.group_id ||
          req.user.class == "admin"
        ) {
          res.render("volunteers/manage", {
            title: "Manage Volunteers",
            volunteers: volunteers,
            group: {
              group_id: req.query.group_id
            }
          });
        } else {
          req.flash("error", "You don't belong to that working group.");
          res.redirect(process.env.PUBLIC_ADDRESS + "/volunteers/manage");
        }
      }
    );
  }
);

module.exports = router;
