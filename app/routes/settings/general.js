// /setting/general

var router = require("express").Router();

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
	Settings.getAll(function(err, settings){
		settings = settings[0];
		settings.definitions = JSON.parse(settings.definitions);
	  	res.render('settings/general', {
	  		title: "General Settings",
	  		settingsActive: true,
	  		settings: settings
	  	});
	});
});

router.post('/', Auth.isLoggedIn, Auth.isAdmin, function(req, res){

	var password_reset = req.body.password_reset;

	if(password_reset == "on") {
		password_reset = 1;
	} else {
		password_reset = 0;
	}


	// Parse request's body
	var errors = req.validationErrors();
    if(errors) {

		res.redirect("/settings");

    } else {

		var settings = {
			password_reset: password_reset
		}

		Settings.updateGeneral(settings, function(err, settings){
			if(err) throw err;

			req.flash('success_msg', 'Settings updated!');
			res.redirect('/settings/general');
		});
    }

});

module.exports = router;