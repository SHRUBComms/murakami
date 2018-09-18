// /api/get/working-groups/join-requests/approve

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Members = require(rootDir + "/app/models/members");
var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/:request_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){

  var message = {
    status: "fail",
    msg: null
  };

  WorkingGroups.getJoinRequestById(req.params.request_id, function(err, request){
    if(err) throw err;
    request = request[0];
    //TODO: sanitize
    Settings.getAll(function(err, settings){
      settings = settings[0]
      settings.definitions = JSON.parse(settings.definitions);
      WorkingGroups.verifyGroupById(request.working_group, settings, function(group){
        if(group){
          Members.getById(request.member_id, function(err, member){

            if(err) throw err;

            member = member[0]

            WorkingGroups.approveJoinRequest(req.params.request_id, function(err){
              if(err) throw err;

                if(member.working_groups){
                  member.working_groups = JSON.parse(member.working_groups);
                } else {
                  member.working_groups = [];
                }

              for(i=0; i<member.working_groups.length; i++){
                if(member.working_groups[i] == request.working_group){
                  var found = true;
                }
              }

              if(found){
                WorkingGroups.deleteJoinRequestById(req.params.request_id, function(err){
                  if(err){
                    message.status = "fail";
                    message.msg = "Already a member! Something went wrong when removing the request";
                    res.send(message);  
                  } else {
                    message.status = "ok";
                    message.msg = "Already a member - request removed!";
                    res.send(message);                    
                  }
                })
              } else {
                member.working_groups.push(request.working_group);
                Members.updateWorkingGroups(request.member_id, JSON.stringify(member.working_groups), function(err){
                  if(err) throw err;
                  message.status = "ok";
                  message.msg = "Member added!";
                  res.send(message);
                });          
              }

            });
          });
        } else {
            message.status = "fail";
            message.msg = "Invalid group!";
            res.send(message);          
        }
      });
    });
  });
});

module.exports = router;