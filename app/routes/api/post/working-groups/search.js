// /api/post/working-groups/search

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var WorkingGroups = Models.WorkingGroups;
var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");

router.post("/", Auth.isLoggedIn, function(req, res) {
  var term = req.body.term;
  var group_id = req.body.group_id;

  if (!term || !group_id) {
    res.send({ status: "ok", results: [] });
  } else {
    Members.searchByNameAndGroup(term, group_id, function(err, members) {
      if (err) {
        res.send({ status: "fail", results: [] });
      } else {
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

                  members[i].name = member.name;
                  members[i].email = member.email;
                  members[i].working_groups = member.working_groups;

                  callback();
                });
              },
              function(err) {
                res.send({ status: "ok", results: members });
              }
            );
          }
        });
      }
    });
  }
});

module.exports = router;
