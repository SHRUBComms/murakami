// /working-groups/add-members

var router = require("express").Router();
var async = require("async");
var emailExistence = require("email-existence");

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings")
var Members = require(rootDir + "/app/models/members")
var WorkingGroups = require(rootDir + "/app/models/working-groups")
var AccessTokens = require(rootDir + "/app/models/access-tokens")

var Auth = require(rootDir + "/app/configs/auth");
var Mail = require(rootDir + "/app/configs/mail");

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
  if(req.user.admin_wg){
    var group = req.user.admin_wg[0].id;
    res.redirect("/working-groups/add-members/" + group);
  }
});

router.get('/:group_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
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

module.exports = router;