// /api/get/working-groups/volunteer-hours/approve

var router = require("express").Router();

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Settings = require(rootDir + "/app/models/settings");
var Transactions = require(rootDir + "/app/models/transactions");
var Members = require(rootDir + "/app/models/members");;

var Auth = require(rootDir + "/app/configs/auth");

router.get('/:shift_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
  var message = {
    status: "fail",
    msg: null
  };

  WorkingGroups.getShiftById(req.params.shift_id, function(err, shift){
    if(err || !shift[0]){
      message.status = "fail";
      message.msg = "Couldn't find that shift!";
      res.send(message)
    }
    console.log(shift)
    var shift = shift[0];


    Members.getById(shift.member_id, function(err, member){

      if(err) throw err;
      member = member[0]
      Settings.getAll(function(err, settings){
        settings = settings[0]
        settings.definitions = JSON.parse(settings.definitions);
        WorkingGroups.verifyGroupById(shift.working_group, settings, function(group){
          if(group) {
            WorkingGroups.approveShift(req.params.shift_id, function(err){
              if(err) throw err;       
              
              var transaction = {
                member_id: member.member_id, 
                transaction_type: 'add', 
                categories: 'volunteering', 
                amount: (Math.floor(shift.duration_as_decimal * group.rate)), 
                comment: "with " + group.name
              };

              if(transaction.amount > 0){
                Transactions.add(transaction, function(err){
                  Members.updateBalance(member.member_id, (+member.balance + +transaction.amount), function(err){
                    Members.updateLastVolunteered(member.member_id, function(){
                      if(member.first_volunteered){
                        Members.updateFirstVolunteered(member.member_id, function(){
                          if(member.free){
                            Members.renew(member.member_id, "2_months", function(){
                              message.status = "ok";
                              message.msg = "Shift approved - " + transaction.amount + " token(s) issued!";
                              res.send(message);
                            });
                          } else {
                            message.status = "ok";
                            message.msg = "Shift approved - " + transaction.amount + " token(s) issued!";
                            res.send(message);                            
                          }
                        });
                      } else {
                        if(member.free){
                          Members.renew(member.member_id, "2_months", function(){
                            message.status = "ok";
                            message.msg = "Shift approved - " + transaction.amount + " token(s) issued!";
                            res.send(message);
                          });
                        } else {
                          message.status = "ok";
                          message.msg = "Shift approved - " + transaction.amount + " token(s) issued!";
                          res.send(message);                            
                        }
                      }
                    });
                  });
                });
              } else {
                Members.updateLastVolunteered(member.member_id, function(){
                  if(member.first_volunteered){
                    Members.updateFirstVolunteered(member.member_id, function(){
                      if(member.free){
                        Members.renew(member.member_id, "2_months", function(){
                          message.status = "ok";
                          message.msg = "Shift approved - no tokens issued!";
                          res.send(message);                          
                        })
                      } else {
                        message.status = "ok";
                        message.msg = "Shift approved - no tokens issued!";
                        res.send(message);                      
                      }
                    });
                  } else {
                    if(member.free){
                      Members.renew(member.member_id, "2_months", function(){
                        message.status = "ok";
                        message.msg = "Shift approved - no tokens issued!";
                        res.send(message);                          
                      })
                    } else {
                      message.status = "ok";
                      message.msg = "Shift approved - no tokens issued!";
                      res.send(message);                      
                    }

                  }
                });
              }
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
});

module.exports = router;