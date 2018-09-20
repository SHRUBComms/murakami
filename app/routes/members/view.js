// /members/view

var router = require("express").Router();

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");
var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/:member_id', Auth.isLoggedIn, function (req, res) {

	console.log(process.env.DIODE_API_KEY);

	Members.getById(req.params.member_id, function(err, member){
		if(err || !member[0]){
			req.flash('error_msg', 'Member not found!');
			res.redirect('/members');
		} else {
			Members.getVolInfoById(req.params.member_id, function(err, volInfo){
				Settings.getAll(function(err, settings){			
					settings = settings[0];
					settings.definitions = JSON.parse(settings.definitions);
					Members.makeNice(member[0], settings, function(member){

						res.render('members/view', {
						  	title: "View Member",
						  	member: member,
						  	settings: settings,
						  	membersActive: true,
						  	volInfo: volInfo,
						  	diode_api_key: process.env.DIODE_API_KEY
						});
					});
				});
			});
		}	
	});
});

module.exports = router;