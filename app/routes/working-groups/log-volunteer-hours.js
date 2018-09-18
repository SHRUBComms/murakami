// /working-groups/review-join-requests

var router = require("express").Router();
var async = require("async");
var request = require('request');
var Recaptcha = require('express-recaptcha').Recaptcha;

var rootDir = process.env.CWD;
var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY);

var Settings = require(rootDir + "/app/models/settings")
var WorkingGroups = require(rootDir + "/app/models/working-groups")
var Members = require(rootDir + "/app/models/members")
var Transactions = require(rootDir + "/app/models/transactions")

var Auth = require(rootDir + "/app/configs/auth");


router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  if(req.user.admin_wg){
    var group = req.user.admin_wg[0].id;
    res.redirect("/working-groups/log-volunteer-hours/" + group);
  } else {
    res.redirect("/error");
  }
});

router.get('/:group_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
      if(group){
        res.render('workingGroups/log-volunteer-hours', {
          title: "Log Volunteer Hours",
          workingGroupsActive: true,
          working_group: group,
          settings: settings
        });
      } else {
        res.redirect('/working-groups');
      }
    });
  });
})

router.post('/', function(req, res){

  var message = {};

  if(req.user){

    var shift = req.body.shift;

    Members.getById(shift.member_id, function(err, member){
      if(err || !member[0]){
        res.send({status: "fail", msg: "Please select a valid member!"})
      } else {
        member = member[0]
        if(!isNaN(shift.duration) && shift.duration <= 24 && shift.duration >= 0.25){
          Settings.getAll(function(err, settings){
            settings = settings[0];
            settings.definitions = JSON.parse(settings.definitions)
            WorkingGroups.verifyGroupById(shift.working_group, settings, function(group){
              if(group){
                if(req.user){
                  if(req.user.admin){
                    shift.approved = 1;
                    WorkingGroups.createShift(shift, function(err){
                      if(err){
                        console.log(err);
                        res.send({status: "fail", msg: "Something went wrong please try again!"})
                      } else {
                        var transaction = {
                          member_id: member.member_id, 
                          transaction_type: 'add', 
                          categories: 'volunteering', 
                          amount: (Math.floor(shift.duration) * group.rate), 
                          comment: "with " + group.name
                        };

                        console.log(transaction)

                        if(transaction.amount > 0){
                          Transactions.add(transaction, function(err){
                            if(err){
                              console.log(err);
                              message.status = "fail";
                              message.msg = "Something went wrong!";
                              res.send(message);                             
                            } else {
                              Members.updateBalance(member.member_id, (+member.balance + +transaction.amount), function(err){
                                if(!err){
                                  if(member.first_volunteered){
                                    Members.updateLastVolunteered(member.member_id, function(){
                                      if(member.free){
                                        Members.renew(member.member_id, "2_months", function(){
                                          message.status = "ok";
                                          message.msg = "Shift logged - " + transaction.amount + " token(s) issued!";
                                          res.send(message);
                                        });
                                      } else {
                                        message.status = "ok";
                                        message.msg = "Shift logged - " + transaction.amount + " token(s) issued!";
                                        res.send(message);                                      
                                      }
                                    })
                                  } else {
                                    Members.updateFirstVolunteered(member.member_id, function(){
                                      Members.updateLastVolunteered(member.member_id, function(){
                                        if(member.free){
                                          Members.renew(member.member_id, "2_months", function(){
                                            message.status = "ok";
                                            message.msg = "Shift logged - " + transaction.amount + " token(s) issued!";
                                            res.send(message);
                                          });
                                        } else {
                                          message.status = "ok";
                                          message.msg = "Shift logged - " + transaction.amount + " token(s) issued!";
                                          res.send(message);                                        
                                        }
                                      })
                                    });
                                  }

                                } else {
                                  console.log(err);
                                  message.status = "fail";
                                  message.msg = "Something went wrong!";
                                  res.send(message);                              
                                }
                              });
                            }
                          });
                        } else {
                          if(member.first_volunteered){
                            Members.updateLastVolunteered(member.member_id, function(){
                              if(member.free){
                                Members.renew(member.member_id, "2_months", function(){
                                  res.send({status: "ok", msg: "Shift logged - no tokens issued!"})
                                })
                              } else {
                                message.status = "ok";
                                message.msg = "Shift logged - " + transaction.amount + " token(s) issued!";
                                res.send(message);                                
                              }
                            });
                          } else {
                            Members.updateFirstVolunteered(member.member_id, function(){
                              Members.updateLastVolunteered(member.member_id, function(){
                                if(member.free){
                                  Members.renew(member.member_id, "2_months", function(){
                                    res.send({status: "ok", msg: "Shift logged - no tokens issued!"})
                                  })
                                } else {
                                  message.status = "ok";
                                  message.msg = "Shift logged - " + transaction.amount + " token(s) issued!";
                                  res.send(message);                                
                                }
                                
                              });
                            });
                          }
     
                        }

                      }
                    })
                  } else {
                    shift.approved = null;

                    WorkingGroups.createShift(shift, function(err){
                      res.send({status: "ok", msg: "Shift logged - awaiting review by an admin!"})
                    })

                  }
                } else {

                  request.post({
                    url: "https://www.google.com/recaptcha/api/siteverify",
                    form: {
                      "secret": process.env.RECAPTCHA_SECRET_KEY,
                      "response": req.body.recaptcha
                    }
                  }, function(error,response,body) {
                    if(body){
                      body = JSON.parse(body);
                      if(body.success == true){
                        shift.approved = null;

                        WorkingGroups.createShift(shift, function(err){

                          res.send({status: "ok", msg: "Shift logged - awaiting review by an admin!"})

                        })
                      } else {
                        res.send({status: "fail", msg: "Please confirm you are not a robot!"})
                      }
                    } else {
                      res.send({status: "fail", msg: "Please confirm you are not a robot!"})
                    }
                  })

                }
              } else {
                  message.status = "fail";
                  message.msg = "Please select a group!";
                  res.send(message);
              }
            
            });
          });
        } else {
            message.status = "fail";
            message.msg = "Please enter valid duration! (between 0.25 and 24 hours)";
            res.send(message);
        }
      }
    });


  } else {
    var member_id = req.body.member_id;
    var duration = req.body.duration;
    var working_group = req.body.working_group;

    if(duration >= 0.25 && duration <= 24) {
      Settings.getAll(function(err, settings){
        settings = settings[0];
        settings.definitions = JSON.parse(settings.definitions)
        WorkingGroups.verifyGroupById(working_group, settings, function(group){
          if(group){
            Members.getById(member_id, function(err, member){

              if(member[0]){
                member = member[0];
                member.working_groups = JSON.parse(member.working_groups);
              
                var isMemberOfWG = false;

                async.each(member.working_groups, function(wg, callback) {

                    if(wg == working_group){
                      isMemberOfWG = true;
                    } 
                    callback()

                }, function(err) {
                  if(isMemberOfWG){

                    shift = {};

                    shift.member_id = member_id;
                    shift.working_group = working_group;
                    shift.duration = duration;
                    shift.approved = null;

                    request.post({
                      url: "https://www.google.com/recaptcha/api/siteverify",
                      form: {
                        "secret": process.env.RECAPTCHA_SECRET_KEY,
                        "response": req.body["g-recaptcha-response"]
                      }
                    }, function(error, response, body) {
                      if(body){
                        body = JSON.parse(body);
                        if(body.success == true){

                          WorkingGroups.createShift(shift, function(err){

                            req.flash("success_msg", "Shift logged - awaiting review by an admin!")
                            res.redirect("/log-volunteer-hours");

                          })
                        } else {
                          req.flash("error", "Please confirm that you're not a robot")
                          res.redirect("/log-volunteer-hours");
                        }
                      } else {
                        req.flash("error", "Please confirm that you're not a robot")
                        res.redirect("/log-volunteer-hours");
                      }
                    })

                  } else {
                    req.flash("error", "Member does not belong to working group")
                    res.redirect("/log-volunteer-hours");                
                  }
                });

              } else {
                req.flash("error", "No member associated with that ID")
                res.redirect("/log-volunteer-hours");               
              }
            })
          } else {
              req.flash("error", "Please select a valid working group")
              res.redirect("/log-volunteer-hours");            
          }
        })
      })
    } else {
      req.flash("error", "Please enter a duration >= 0.25 and <= to 24")
      res.redirect("/log-volunteer-hours");  
    }

  }


})

module.exports = router;