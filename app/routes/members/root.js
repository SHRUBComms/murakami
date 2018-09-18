// /members

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Members = require(rootDir + "/app/models/members");;
var Settings = require(rootDir + "/app/models/settings");;

var Auth = require(rootDir + "/app/configs/auth");

router.get('/', Auth.isLoggedIn, function (req, res) {
	Members.getAll(function(err, members){
		Settings.getAll(function(err, settings){
			if(settings && !err){
				settings = settings[0];
				settings.definitions = JSON.parse(settings.definitions);
				async.eachOf(members, function(member, i, callback){
					Members.makeNice(members[i], settings, function(member){
						members[i] = member;
						callback();
					});
				}, function (err) {
					res.render('members/all', {
					  	title: "Members",
					  	members: members,
					  	membersActive: true	
					});
				});
			} else {
				console.log(err);
				res.redirect("/error");
			}		
		})

	});
});

router.use("/add", require("./add"))
router.use("/update", require("./update"))
router.use("/view", require("./view"))
router.use("/volunteer-info", require("./volunteer-info"))

module.exports = router;