// /api/post/members/search

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

function censorName(name){
    var name = name.split(' ');
    nameCensored = name[0] + " ";
    name.splice(0, 1);
    for(i=0; i<name.length;i++){
      middleLength = name[i].length - 2
      nameCensored += name[i].slice(0,1) + "*".repeat(middleLength) + name[i].slice(-1)
      if(i+1 != name.length){
        nameCensored += " ";
      }
    }
    return nameCensored;
}

function censorEmail(email){
    var email = email.split('@');
    usernameMiddleLength = email[0].length - 2;
    domainMiddleLength = email[1].length -2;
    return email[0].slice(0,1) + "*".repeat(usernameMiddleLength) + email[0].slice(-1) + "@" + email[1].slice(0, 1) + "*".repeat(domainMiddleLength) + email[1].slice(-1);  
}

router.post('/', function(req, res){
  var term = req.body.term;
  if(!term) {
    res.send({status: "ok", results: []});
  } else {
    Members.searchByName(term, function(err, members){
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
              if(req.user){
                if(req.user.admin){
                  members[i].name = member.name;
                  members[i].email = member.email;
                  members[i].working_groups = member.working_groups;
                } else if (req.user) {
                  members[i].name = member.name;
                  members[i].email = censorEmail(member.email)
                  members[i].working_groups = member.working_groups;
                }
              } else {
                members[i].name = censorName(member.name);
                members[i].email = censorEmail(member.email)
                members[i].working_groups = member.working_groups;
              }

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

module.exports = router;