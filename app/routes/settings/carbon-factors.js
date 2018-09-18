// /settings/carbon-calculations

var router = require("express").Router();

var rootDir = process.env.CWD;

var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
	Settings.getAll(function(err, settings){
		settings = settings[0];
		settings.definitions = JSON.parse(settings.definitions);
	  	res.render('settings/carbon-calculations', {
	  		title: "Carbon Calculation Factors",
	  		settingsActive: true,
	  		settings: settings
	  	});
	});
});

router.post('/', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
	var factors = req.body.factors;
	var sanitizedFactors = {};
	// validate posted items

	Settings.getAll(function(err, settings){
		settings = settings[0];
		settings.definitions = JSON.parse(settings.definitions);

		for(i=0; i<settings.definitions.items.length; i++){
			Object.keys(factors).forEach(function(key) {
				if(key == settings.definitions.items[i].id && !isNaN(factors[key])){
					settings.definitions.items[i].factor = factors[key];
				}
			});
		}

		Settings.updateDefinitions(JSON.stringify(settings.definitions), function(err){
			if(err){
				req.flash("error_msg", "Something went wrong!")
				res.redirect('/settings/carbon-factors')
			} else {
				req.flash("success_msg", "Factors successfully updated!")
				res.redirect('/settings/carbon-factors')
			}
		})
	});

});

module.exports = router;