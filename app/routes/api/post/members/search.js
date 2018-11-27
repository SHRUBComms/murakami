// /api/post/members/search

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var WorkingGroups = require(rootDir + "/app/models/working-groups");

var Auth = require(rootDir + "/app/configs/auth");

function censorEmail(email) {
  var email = email.split("@");
  usernameMiddleLength = email[0].length - 2;
  domainMiddleLength = email[1].length - 2;
  return (
    email[0].slice(0, 1) +
    "*".repeat(usernameMiddleLength) +
    email[0].slice(-1) +
    "@" +
    email[1].slice(0, 1) +
    "*".repeat(domainMiddleLength) +
    email[1].slice(-1)
  );
}

router.post("/", Auth.isLoggedIn, function(req, res) {
  var term = req.body.term;
  if (!term) {
    res.send({ status: "ok", results: [] });
  } else {
    Members.searchByName(term, function(err, members) {
      WorkingGroups.getAll(function(err, working_groups) {
        if (err) {
          res.send({ status: "fail", results: [] });
        } else {
          async.eachOf(
            members,
            function(member, i, callback) {
              Members.makeSearchNice(members[i], working_groups, function(
                member
              ) {
                members[i] = {};
                members[i].id = member.id;
                members[i].first_name = member.first_name;

                if (["admin", "volunteer"].includes(req.user.class)) {
                  members[i].name = member.name;
                  members[i].email = member.email;
                  members[i].working_groups = member.working_groups;
                } else {
                  members[i].name = member.name;
                  members[i].email = censorEmail(member.email);
                  members[i].working_groups = member.working_groups;
                }

                callback();
              });
            },
            function(err) {
              res.send({ status: "ok", results: members });
            }
          );
        }
      });
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
              formattedMember.email = censorEmail(member.email);
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
