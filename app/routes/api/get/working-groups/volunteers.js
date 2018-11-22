// /api/get/working-groups/volunteers

var router = require("express").Router();
var async = require("async");
var moment = require("moment");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:group_id", Auth.isLoggedIn, Auth.isVolunteerOrAdmin, function(
  req,
  res
) {
  Members.getVolunteerInfoByGroupId(req.params.group_id, function(
    err,
    members
  ) {
    var formattedMembers = [];
    async.eachOf(
      members,
      function(member, i, callback) {
        formattedMembers[i] = {};
        formattedMembers[i].name =
          '<a href="/members/view/' +
          member.member_id +
          '">' +
          member.first_name +
          " " +
          member.last_name +
          "</a>";
        formattedMembers[i].email = member.email;
        formattedMembers[i].volunteerInfoLastUpdated = moment(
          member.lastUpdated
        ).format("DD/MM/YY");
        formattedMembers[i].options =
          "<a class='btn btn-success' href='/members/volunteer-info/" +
          member.member_id +
          "'>Update/View Volunteer</a>";
        callback();
      },
      function(err) {
        res.send(formattedMembers);
      }
    );
  });
});

module.exports = router;
