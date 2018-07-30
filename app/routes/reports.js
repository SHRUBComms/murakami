// Import resources
var express = require('express');
var router = express.Router();
var app = express();
var async = require("async");

var Analytics = require("../models/analytics");
var Members = require("../models/members");
var WorkingGroups = require("../models/working-groups")
var Auth = require("../configs/auth");
var Settings = require("../models/settings");
var Carbon = require("../models/carbon-calculations");
var Transactions = require("../models/transactions");

router.get('/', function (req, res) {
	res.redirect('/reports/analytics');
});

router.get('/export', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
  res.render('reports/export', {
  	title: "View/Export Data",
  	reportsActive: true
  });	
});

router.get('/export/members', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
	Members.getAll(function(err, members){
		Settings.getAll(function(err, settings){
			settings = settings[0];
			settings.definitions = JSON.parse(settings.definitions);
			async.eachOf(members, function(member, i, callback){
				Members.makeNice(members[i], settings, function(member){
					members[i] = member;
					callback();
				});
			}, function(err){

				res.render('reports/export/members', {
				  	title: "View/Export Members",
				  	reportsActive: true,
				  	members: members
				});
			});			
		})

	});
});

router.get('/export/volunteer-hours', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
	WorkingGroups.getAllVolunteerHours(function(err, hours){
		if(err) throw err;
		Settings.getAll(function(err, settings){
			settings = settings[0]
			settings.definitions = JSON.parse(settings.definitions);
	        async.eachOf(hours, function(hour, i, callback){
	          WorkingGroups.makeVolunteerHoursNice(hours[i], settings, function(hour){
	            hours[i] = hour;
	            callback();
	          });

	        }, function (err) {

				res.render('reports/export/volunteer-hours', {
				  	title: "View/Export Volunteer Hours",
				  	reportsActive: true,
				  	hours: hours,
				  	settings: settings
				});
			});			
		})

	});
});


router.get('/analytics', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
  res.render('reports/analytics', {
  	title: "Analytics",
  	reportsActive: true
  });	
});


router.get('/analytics/volunteer-hours', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
	Analytics.getVolunteerHours(null, function(data){
		console.log(data);
		res.render('reports/volunteer-hours', {
		  	title: "Volunteer Hours",
		  	reportsActive: true,
		  	data: data
		});	
	});
});

/* AJAX */

router.get('/analytics/carbon-saved-today', Auth.isLoggedIn, function(req, res){
  Carbon.getToday(function(err, carbon){
    if(err || carbon.length == 0){
      res.send("0");
    } else {
      totalCarbon = 0;
      Settings.getAll(function(err, settings){
        settings = settings[0];
        settings.definitions = JSON.parse(settings.definitions);
        for(i=0;i<carbon.length;i++){
          carbon[i].trans_object = JSON.parse(carbon[i].trans_object);

          Object.keys(carbon[i].trans_object).forEach(function(key) {
              for(j=0;j<settings.definitions.items.length;j++){
                if(key == settings.definitions.items[j].id){
                  totalCarbon += (carbon[i].trans_object[key] * settings.definitions.items[j].factor) * 1e-3;
                }
              }
          });
        }

        res.send(totalCarbon.toFixed(2));
      });
    }
  });
});

router.get('/analytics/members-who-joined-today', Auth.isLoggedIn, function(req, res){
	Members.getMembersWhoJoinedToday(function(err, members){
		res.send(members.length.toString());
	})
});

router.get('/analytics/swaps-today', Auth.isLoggedIn, function(req, res){
	Transactions.getSwapsToday(function(err, transactions){
		res.send(transactions.length.toString());
	})
});

router.get('/analytics/current-members', Auth.isLoggedIn, function(req, res){
	Members.getAllCurrentMembers(function(err, members){
		res.send(members.length.toString());
	})
});

router.get('/analytics/total-hours-volunteered-this-month', function(req, res){
	WorkingGroups.getHoursThisMonth(function(err, hours){
		if(hours[0]["SUM(duration_as_decimal)"]){
			res.send(hours[0]["SUM(duration_as_decimal)"].toString());
		} else {
			res.send("0");
		}
	})
});

router.get('/analytics/new-volunteers-this-month', function(req, res){
	Members.getNewVolsThisMonth(function(err, members){
		res.send(members.length.toString());
	})
});

router.get('/analytics/total-volunteers', function(req, res){
	Members.getAllVolunteers(function(err, members){
		res.send(members.length.toString());
	})
});

router.get('/analytics/new-members/:group_id', function(req, res){
	WorkingGroups.getNewMembersByGroupId(req.params.group_id, function(err, members){
		res.send(members.length.toString());
	})
});

router.get('/analytics/total-members/:group_id', function(req, res){
	WorkingGroups.getAllMembersByGroup(req.params.group_id, function(err, members){
		res.send(members.length.toString());
	})
});

module.exports = router;