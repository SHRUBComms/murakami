// /api/get/working-groups/members

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:group_id", Auth.isLoggedIn, Auth.isOfClass(["admin", "volunteer"]), function(
  req,
  res
) {
  WorkingGroups.getAllMembersByGroup(req.params.group_id, function(
    err,
    members
  ) {
    var formattedMembers = [];
    async.eachOf(
      members,
      function(member, i, callback) {
        formattedMembers[i] = {};
        formattedMembers[i].name =
          '<a href="' + process.env.PUBLIC_ADDRESS + '/members/view/' +
          member.member_id +
          '">' +
          member.first_name +
          " " +
          member.last_name +
          "</a>";
        formattedMembers[i].email = member.email;
        formattedMembers[i].options =
          '<a class="btn btn-danger" onclick="removeMemberAjax(\'/api/get/working-groups/members/leave/' +
          req.params.group_id +
          "/" +
          member.member_id +
          "')\">Remove From Group</a>";
        callback();
      },
      function(err) {
        res.send(formattedMembers);
      }
    );
  });
});

router.use("/join", require("./join"));
router.use("/leave", require("./leave"));

module.exports = router;
