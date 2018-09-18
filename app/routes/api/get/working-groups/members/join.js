// /api/get/working-groups/members/join

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Settings = require(rootDir + "/app/models/settings");
var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/:working_group/:member_id', Auth.isLoggedIn, function(req, res){

  var message = {
    status: "fail",
    msg: null
  };
  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.working_group, settings, function(group){
      if(group){

        Members.getById(req.params.member_id, function(err, member){
          if(err || !member[0]){
            message.status = "fail";
            message.msg = "Something went wrong!";
            res.send(message);                  
          } else {

            member = member[0];

            if(member.working_groups){
              member.working_groups = JSON.parse(member.working_groups);
            } else {
              member.working_groups = [];
            }
            for(i=0; i<member.working_groups.length; i++){
              if(member.working_groups[i] == req.params.working_group){
                var found = true;
              }
            }

            if(found){
                message.status = "fail";
                message.msg = "Already a member!";
                res.send(message);
            } else {
              if(req.user.admin){
                member.working_groups.push(req.params.working_group);
                member.working_groups = JSON.stringify(member.working_groups.sort());
                Members.updateWorkingGroups(req.params.member_id, member.working_groups, function(err){
                  if(err){
                    message.status = "fail";
                    message.msg = "Something went wrong!";
                    res.send(message);                  
                  };
                  message.status = "ok";
                  message.msg = "Member added!";
                  res.send(message);
                });
              } else {

                WorkingGroups.getJoinRequestByMemberId(member.member_id, group.id, function(err, requests){
                  if(requests[0] == null){
                    WorkingGroups.createJoinRequest(member.member_id, group.id, function(err){
                      if(err){
                        message.status = "fail";
                        message.msg = "Something went wrong!";
                        res.send(message);                  
                      } else {
                        message.status = "ok";
                        message.msg = "Requested to join " + group.name + "!";
                        res.send(message);
                      }
                    });
                  } else {
                      message.status = "fail";
                      message.msg = "Already requested to join " + group.name + "!";
                      res.send(message);
                  }
                });

              }
            }
          }
        });

      } else {
          message.status = "fail";
          message.msg = "Group not found!";
          res.send(message);
      }
    });
  });
});

module.exports = router;