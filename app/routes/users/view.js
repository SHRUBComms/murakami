// /users/view

var router = require("express").Router();

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var Settings = require(rootDir + "/app/models/settings");
var WorkingGroups = require(rootDir + "/app/models/working-groups")

var Auth = require(rootDir + "/app/configs/auth");

router.get('/:user_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
	Users.getById(req.params.user_id, function(err, viewedUser){
		if(viewedUser[0] && !err){
			if(viewedUser[0].deactivated == 0){
				Settings.getAll(function(err, settings){
					settings = settings[0];
					settings.definitions = JSON.parse(settings.definitions);

					Users.makeNice(viewedUser[0], settings, function(beautifulViewedUser){
						res.render('users/view', {
						  	title: "View User",
						  	usersActive: true,
						  	settings: settings,
						  	viewedUser: beautifulViewedUser
						});	
					})
				})
			} else {
				req.flash("error", "Couldn't find that user!")
				res.redirect("/users");				
			}

		} else {
			req.flash("error", "Couldn't find that user!")
			res.redirect("/users");
		}	
	})
});

module.exports = router;