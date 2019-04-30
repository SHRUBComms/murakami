// /api/post/members/search

var router = require("express").Router();
var async = require("async");
var lodash = require("lodash");

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
      var sanitizedMembers = [];
      async.eachOf(
        members,
        function(member, i, callback) {
          Members.sanitizeMember(member, req.user, function(
            err,
            sanitizedMember
          ) {
            if (sanitizedMember) {
              sanitizedMembers.push(sanitizedMember);
              callback();
            } else {
              callback();
            }
          });
        },
        function(err) {
          res.send({
            status: "ok",
            results: sanitizedMembers
          });
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
            Members.sanitizeMember(member, req.user, function(
              err,
              sanitizedMember
            ) {
              sanitizedMember.id = member.member_id;
              sanitizedMember.membership_expires =
                sanitizedMember.current_exp_membership;
              formattedMembers.push(sanitizedMember);
              callback();
            });
          },
          function(err) {
            res.send({ status: "ok", results: formattedMembers });
            console.log(formattedMembers);
          }
        );
      }
    });
  }
});

module.exports = router;
