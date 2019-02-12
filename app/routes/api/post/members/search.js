// /api/post/members/search

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

router.post("/", Auth.isLoggedIn, function(req, res) {
  var term = req.body.term;
  if (!term) {
    res.send({ status: "ok", results: [] });
  } else {
    Members.searchByName(term, function(err, members) {
      
      async.eachOf(
        members,
        function(member, i, callback) {
          Members.sanitizeMember(members[i], req.user, function(err, member) {
            members[i] = {};
            members[i].id = member.member_id;
            members[i].first_name = member.first_name;

            members[i].name = member.full_name;
            members[i].email = member.email || "Not available";
            members[i].working_groups = member.working_groups;

            async.eachOf(
              members[i].working_groups,
              function(member, j, callback) {
                members[i].working_groups[j] =
                  req.user.allWorkingGroupsObj[members[i].working_groups[j]];
                callback();
              },
              function() {
                callback();
              }
            );
          });
        },
        function(err) {
          
          res.send({ status: "ok", results: members });
        }
      );
    });
  }
});

router.post("/simple", Auth.isLoggedIn, function(req, res) {
  var term = req.body.term;
  if (!term) {
    res.send({ status: "ok", results: [] });
  } else {
    Members.searchByName(term, function(err, members) {
      if (err) {
        res.send({ status: "fail", results: [] });
      } else {
        var formattedMembers = [];
        async.each(
          members,
          function(member, callback) {
            var isMember;
            if (member.is_member == 1) {
              isMember = true;
            }

            var formattedMember = {};
            formattedMember.id = member.member_id;
            formattedMember.name = member.first_name + " " + member.last_name;
            formattedMember.balance = member.balance;
            formattedMember.is_member = isMember;
            formattedMember.membership_expires = member.current_exp_membership;
            if (!["admin"].includes(req.user.class)) {
              formattedMember.email = "Not available";
            } else {
              formattedMember.email = member.email;
            }

            formattedMembers.push(formattedMember);
            callback();
          },
          function(err) {
            res.send({ status: "ok", results: formattedMembers });
          }
        );
      }
    });
  }
});

module.exports = router;
