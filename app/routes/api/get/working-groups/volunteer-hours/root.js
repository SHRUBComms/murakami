// /api/get/working-groups/volunteer-hours

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var WorkingGroups = require(rootDir + "/app/models/working-groups");
var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/:group_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
  Settings.getAll(function(err, settings){
    settings = settings[0]
    settings.definitions = JSON.parse(settings.definitions);
    WorkingGroups.verifyGroupById(req.params.group_id, settings, function(group){
      if(group){
        WorkingGroups.getUnreviewedVolunteerHoursById(req.params.group_id, function(err, hours){
          if(err || !hours) {
            console.log(err);
            res.send([]);
          } else {

            var formattedHours = [];

            async.eachOf(hours, function(hour, i, callback){
              WorkingGroups.makeVolunteerHoursNice(hour, settings, function(hour){
                formattedHours[i] = {};

                formattedHours[i].name = '<a href="/members/view/' + hour.member_id + '">' + hour.name + '</a>';
                formattedHours[i].date = hour.date;
                formattedHours[i].duration = hour.duration;
                formattedHours[i].tokens = hour.tokens;
                formattedHours[i].options = '<a class="btn btn-success" onclick="volunteerHoursAjax(\'/api/get/working-groups/volunteer-hours/approve/' + hours[i].shift_id + '\')">Approve</a>' +
                '&emsp;<a class="btn btn-danger" onclick="volunteerHoursAjax(\'/api/get/working-groups/volunteer-hours/deny/' + hours[i].shift_id + '\')">Deny</a>';
                callback();
              });

            }, function (err) {
              res.send(formattedHours);
            });            
          }


        });
      } else {
        res.send([]);
      }
    });
  });
});

router.use("/approve", require("./approve"));
router.use("/deny", require("./deny"));

module.exports = router;