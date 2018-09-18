// /api/post/working-groups/search

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

router.post('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  var term = req.body.term;
  var group_id = req.body.group_id;

  if(!term || !group_id) {
    res.send({status: "ok", results: []});
  } else {
    Members.searchByNameAndGroup(term, group_id, function(err, members){

      if(err){
        res.send({status: "fail", results: []});
      } else {
        Settings.getAll(function(err, settings){
          settings = settings[0];
          settings.definitions = JSON.parse(settings.definitions)
          if(err){
            res.send({status: "fail", results: []});
          } else {
            async.eachOf(members, function(member, i, callback){
              Members.makeSearchNice(members[i], settings, function(member){
                members[i] = {};
                members[i].id = member.id

                members[i].name = member.name;
                members[i].email = member.email;
                members[i].working_groups = member.working_groups;

                callback();
              });
            }, function (err) {

              res.send({status: "ok", results: members});
            });
            
          }
        })

        }
    });
  }
});

module.exports = router;