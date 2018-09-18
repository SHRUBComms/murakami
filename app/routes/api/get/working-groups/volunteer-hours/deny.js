// /api/get/working-groups/volunteer-hours/deny

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Settings = require(rootDir + "/app/models/settings");
var Members = require(rootDir + "/app/models/members");;

var Auth = require(rootDir + "/app/configs/auth");


router.get('/:shift_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
  var message = {
    status: "fail",
    msg: null
  };

  WorkingGroups.getShiftById(req.params.shift_id, function(err, shift){
    if(err) throw err;
    var shift = shift[0];

    if(shift.approved !== null){
      message.status = "ok";
      message.msg = "Shift has already been approved!";
      res.send(message); 
    } else {
      Settings.getAll(function(err, settings){
        settings = settings[0]
        settings.definitions = JSON.parse(settings.definitions);
        WorkingGroups.verifyGroupById(shift.working_group, settings, function(group){
          if(group) {
            Members.getById(shift.member_id, function(err, member){

              if(err) throw err;
              member = member[0]

              WorkingGroups.verifyGroupById(shift.working_group, settings, function(group){

                WorkingGroups.denyShift(req.params.shift_id, function(err){
                  if(err) throw err;

                    message.status = "ok";
                    message.msg = "Shift rejected!";
                    res.send(message);       
                  
                });

              });
            });
          } else {
              message.status = "fail";
              message.msg = "Invalid group!";
              res.send(message); 
          }
        });
      });      
    }


  });  
});

module.exports = router;