// Import resources
var express = require('express');
var router = express.Router();
var app = express();
var async = require("async");
var emailExistence = require("email-existence");
var request = require('request');
var Recaptcha = require('express-recaptcha').Recaptcha;
 
var recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY);

var WorkingGroups = require("../models/working-groups");
var Members = require("../models/members");
var Auth = require('../configs/auth')
var Transactions = require('../models/transactions')
var Mail = require("../configs/mail");
var AccessTokens = require("../models/access-tokens")
var Settings = require("../models/settings");
var Helpers = require("../configs/helpful_functions");

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  res.redirect("/working-groups/members");
});

router.get('/members', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  if(req.user.admin_wg){
    var group = req.user.admin_wg[0].id;
    res.redirect("/working-groups/members/" + group);
  } else {
    res.redirect("/error");
  }
});

router.get('/members/:group_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
      if(group){

        WorkingGroups.getAllMembersByGroup(req.params.group_id, function(err, members){
          res.render('workingGroups/view-members', {
            title: "View Working Group Members",
            workingGroupsActive: true,
            working_group: group,
            members: members
          });
        });

      } else {
        res.redirect('/working-groups');
      }
    });  
  });
});

router.post('/members/search', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  var term = req.body.term;
  var group_id = req.body.group_id;

  if(!term || !group_id) {
    res.send({status: "ok", results: []});
  } else {
    Members.searchByNameAndGroup(term, group_id, function(err, members){
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
    });
  }
});

router.get('/review-join-requests', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  if(req.user.admin_wg){
    var group = req.user.admin_wg[0].id;
    res.redirect("/working-groups/review-join-requests/" + group);
  } else {
    res.redirect("/error");
  }
});

router.get('/review-join-requests/:group_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
      if(group){
        WorkingGroups.getAllUnreviewedJoinRequests(req.params.group_id, function(err, joinRequests){
          if(err) throw err;
          async.eachOf(joinRequests, function(request, i, callback){
            WorkingGroups.makeJoinRequestNice(joinRequests[i], function(request){
              joinRequests[i] = request;
              callback();
            });
          }, function(err) {
              res.render('workingGroups/review-join-requests', {
                title: "Review Join Requests",
                workingGroupsActive: true,
                working_group: group,
                joinRequests: joinRequests
              });
          });

        });
      } else {
        res.redirect('/working-groups');
      }
    });  
  });
});

router.get('/get-join-requests/:group_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
      if(group){
        WorkingGroups.getAllUnreviewedJoinRequests(req.params.group_id, function(err, joinRequests){
          if(err) throw err;

          formattedJoinRequests = [];
          async.eachOf(joinRequests, function(request, i, callback){
            WorkingGroups.makeJoinRequestNice(joinRequests[i], function(niceRequest){
              formattedJoinRequests[i] = {};
              formattedJoinRequests[i].name = "<a href='/members/view/" + niceRequest.member_id + "'>" + niceRequest.name + "</a>";
              formattedJoinRequests[i].date = niceRequest.date;
              formattedJoinRequests[i].options = '<a class="btn btn-success" onclick="joinRequestsAjax(\'/working-groups/members/approve/' + niceRequest.id + '\')">Approve</a>' +
              '&emsp;<a class="btn btn-danger" onclick="joinRequestsAjax(\'/working-groups/members/deny/' + niceRequest.id + '\')">Deny</a>';

              callback();
            });

          }, function (err) {

            res.send(formattedJoinRequests);
          });

        });
      } else {
        res.send("Invalid group!");
      }
    });
  });
});

router.get('/get-members/:group_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
  WorkingGroups.getAllMembersByGroup(req.params.group_id, function(err, members){
    var formattedMembers = [];
    async.eachOf(members, function(member, i, callback){

      formattedMembers[i] = {};
      formattedMembers[i].name = '<a href="/members/view/' + member.member_id + '">' + member.first_name + " " + member.last_name + '</a>';
      formattedMembers[i].email = member.email;
      formattedMembers[i].options = '<a class="btn btn-danger" onclick="removeMemberAjax(\'/working-groups/members/remove/' + req.params.group_id + '/' + member.member_id + '\')">Remove From Group</a>'
      callback();

    }, function (err) {
      res.send(formattedMembers);
    });
  });
});

router.get('/review-volunteer-hours', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  if(req.user.admin_wg){
    var group = req.user.admin_wg[0].id;
    res.redirect("/working-groups/review-volunteer-hours/" + group);
  }
});

router.get('/review-volunteer-hours/:group_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
      if(group){

        res.render('workingGroups/review-volunteer-hours', {
          title: "Review Volunteer Hours",
          workingGroupsActive: true,
          working_group: group
        });

      } else {
        res.redirect('/working-groups');
      }
    });  
  });
});

router.get('/view-volunteer-hours', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  if(req.user.admin_wg){
    var group = req.user.admin_wg[0].id;
    res.redirect("/working-groups/view-volunteer-hours/" + group);
  }
});

router.get('/view-volunteer-hours/:group_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
      if(group){
        WorkingGroups.getAllApprovedVolunteerHoursByGroupId(group.id, function(err, hours){

          formattedHours = [];

          async.eachOf(hours, function(hour, i, callback){

            WorkingGroups.makeVolunteerHoursNice(hours[i], settings, function(hour){
              formattedHours[i] = {};
              formattedHours[i].member_id = hour.member_id;
              formattedHours[i].name = '<a href="/members/view/' + hour.member_id + '">' + hour.name + '</a>';
              formattedHours[i].date = hour.date;
              formattedHours[i].duration = hour.duration;
              callback();
            });

          }, function (err) {

            res.render('workingGroups/view-volunteer-hours', {
              title: "View Volunteer Hours",
              workingGroupsActive: true,
              working_group: group,
              hours: formattedHours
            });
          });

        })

      } else {
        res.redirect('/working-groups');
      }
    });  
  });
});


router.get('/get-unreviewed-vol-hours/:group_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
      if(group){
        WorkingGroups.getUnreviewedVolunteerHoursById(req.params.group_id, function(err, hours){
          if(err) throw err;
          console.log(hours);

          formattedHours = [];

          async.eachOf(hours, function(hour, i, callback){
            WorkingGroups.makeVolunteerHoursNice(hours[i], settings, function(hour){
              formattedHours[i] = {};

              formattedHours[i].name = '<a href="/members/view/' + hour.member_id + '">' + hour.name + '</a>';
              formattedHours[i].date = hour.date;
              formattedHours[i].duration = hour.duration;
              formattedHours[i].tokens = hour.tokens;
              formattedHours[i].options = '<a class="btn btn-success" onclick="volunteerHoursAjax(\'/working-groups/volunteer-hours/approve/' + hours[i].shift_id + '\')">Approve</a>' +
              '&emsp;<a class="btn btn-danger" onclick="volunteerHoursAjax(\'/working-groups/volunteer-hours/deny/' + hours[i].shift_id + '\')">Deny</a>';
              callback();
            });

          }, function (err) {

            res.send(formattedHours);
          });

        });
      } else {
        res.send([]);
      }
    });
  });
});

router.get('/add-members', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
  if(req.user.admin_wg){
    var group = req.user.admin_wg[0].id;
    res.redirect("/working-groups/add-members/" + group);
  }
});

router.get('/add-members/:group_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
      if(group){
        res.render('workingGroups/add-members', {
          title: "Batch Add Members",
          workingGroupsActive: true,
          working_group: group
        });
      } else {
        res.redirect('/working-groups');
      }
    });
  });
});

router.post('/add-members/:group_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {

  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
      if(group){
        var name = req.body.name;
        var address = req.body.address;
        var working_group = req.body.working_group;
        Members.getByEmail(address, function(err, member){
          if(!member[0]){
            emailExistence.check(address, function(err, response){
              console.log(response);
              if(response){
                //generate one time link
                AccessTokens.add("add_member", function(err, access){
                  console.log(access);
                  Mail.sendGeneral(name + "<" + address + ">", "Membership Sign Up", "<h1>Hey!</h1>" + 
                  "<p>You've been sent this email by an admin of " + working_group + " from the Shrub Co-op - we'd like you to sign up on our database system so we can keep track of your information. Please follow <a href='https://murakami.org.uk/members/add?token=" + access[0].token + "'>this link</a> to sign up :)</p>" + 
                  "<p>Many thanks,</p>" + 
                  "<p>Shrub x</p>" +
                  "<p><a href='https://murakami.org.uk/privacy'>Privacy Policy</a></p>", 
                  function(err){
                    res.send({status: "ok", msg: name + " has been emailed a sign up link!"});
                  })        
                })
              } else {
                res.send({status: "fail", msg: "Email doesn't exists"});
              }
            });      
          } else {
            res.send({status: "fail", msg: "A member with this email address already exists - <a href='/members/view/" + member[0].member_id + "' target='_blank'>view member</a>"});
          }
        })
      } else {
        res.send({status: "fail", msg: "Invalid group!"});
      }
    });
  });
});

router.get('/log-volunteer-hours', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  if(req.user.admin_wg){
    var group = req.user.admin_wg[0].id;
    res.redirect("/working-groups/log-volunteer-hours/" + group);
  } else {
    res.redirect("/error");
  }
});

router.get('/log-volunteer-hours/:group_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
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

router.post('/log-volunteer-hours', function(req, res){

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


            

/* AJAX */

router.get('/members/approve/:request_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){

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

router.get('/members/deny/:request_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
  var message = {
    status: "fail",
    msg: null
  };


  WorkingGroups.getJoinRequestById(req.params.request_id, function(err, request){
    if(err){
      message.status = "fail";
      message.msg = "Something went wrong!";
      res.send(message);                  
    } else {
      //TODO: sanitize
      WorkingGroups.denyJoinRequest(req.params.request_id, function(err){
        if(err){
          message.status = "fail";
          message.msg = "Something went wrong!";
          res.send(message);                  
        } else {
          message.status = "ok";
          message.msg = "Member not added!";
          res.send(message);
        }
      });
    }
  });

});

router.get('/members/remove/:working_group/:member_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
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
          if(err){
            message.status = "fail";
            message.msg = "Something went wrong!";
            res.send(message);                  
          } else {
            member = member[0];
            member.working_groups = JSON.parse(member.working_groups);
            for(i=0; i<member.working_groups.length; i++){
              if(member.working_groups[i] == req.params.working_group){
                var found = true;
                member.working_groups.splice(i, 1);
              }
            }

            if(found){
              member.working_groups = JSON.stringify(member.working_groups);
              Members.updateWorkingGroups(req.params.member_id, member.working_groups, function(err){
                if(err){
                  message.status = "fail";
                  message.msg = "Something went wrong!";
                  res.send(message);                  
                } else {
                  message.status = "ok";
                  message.msg = "Member removed!";
                  res.send(message);
                }
              });
            } else {
              message.status = "fail";
              message.msg = "Not a member!";
              res.send(message);
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

router.get('/members/join/:working_group/:member_id', Auth.isLoggedIn, function(req, res){

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
                member.working_groups = JSON.stringify(member.working_groups);
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

router.get('/volunteer-hours/approve/:shift_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
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
    shift = shift[0];


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

router.get('/volunteer-hours/deny/:shift_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
  var message = {
    status: "fail",
    msg: null
  };

  WorkingGroups.getShiftById(req.params.shift_id, function(err, shift){
    if(err) throw err;
    shift = shift[0];
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
  });  
});

module.exports = router;