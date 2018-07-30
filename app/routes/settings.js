// Import resources
var express = require('express');
var router = express.Router();
var app = express();

var Settings = require("../models/settings");
var Auth = require("../configs/auth");


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

router.get('/working-groups', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
	Settings.getAll(function(err, settings){
		settings = settings[0];
		settings.definitions = JSON.parse(settings.definitions);
	  	res.render('settings/working-groups', {
	  		title: "Working Group Settings",
	  		settingsActive: true,
	  		settings: settings
	  	});
	});
});

router.get('/carbon-factors', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
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

router.post('/carbon-factors', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
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

router.post('/update', Auth.isLoggedIn, Auth.isAdmin, function(req, res){

	var password_reset = req.body.password_reset;

	if(password_reset == "on") {
		password_reset = 1;
	} else {
		password_reset = 0;
	}

	// Validation
	/*req.checkBody("first_name", "Please enter a first name").notEmpty();
	req.checkBody("first_name", "Please enter a shorter first name (<= 20 characters)").isLength({max: 20});

	req.checkBody("last_name", "Please enter a last name").notEmpty();
	req.checkBody("last_name", "Please enter a shorter last name (<= 30 characters)").isLength({max: 30});

	req.checkBody("email", "Please enter an email address").notEmpty();
	req.checkBody("email", "Please enter a shorter email address (<= 89 characters)").isLength({max: 89});
	req.checkBody("email", "Please enter a valid email address").isEmail();

	if(phone_no){
		req.checkBody("phone_no", "Please enter a shorter phone number (<= 15)").isLength({max: 15});
		req.checkBody("phone_no", "Please enter a valid UK phone number").isMobilePhone("en-GB");
	}*/



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
			res.redirect('/settings');
		});
    }

});

router.get('/email-templates', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
	Settings.getEmailTemplates(function(err, templates){
		if(err) throw err;
		res.redirect('/settings/email-templates/' + templates[0].mail_id);
	})
});

router.get('/email-templates/:mail_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {

	Settings.getEmailTemplates(function(err, templates){
		if(err) throw err;
		Settings.getEmailTemplateById(req.params.mail_id, function(err, template){
			if(err || !template[0]) {
				res.redirect('/settings/email-templates/');
			} else {
				res.render('settings/email-templates', {
				  	title: "Email Templates",
				  	settingsActive: true,
				  	templates: templates,
				  	template: template[0]
				});
			}
		});
	});

});

router.post('/email-templates/:mail_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
	Settings.getEmailTemplateById(req.params.mail_id, function(err, template){
		if(err || !template[0]) {
			res.send("Couldn't find that template!");
		}

		var subject = req.body.subject;
		var message = req.body.message;
		var active = req.body.active;

		console.log(active);

		if(active == "true"){
			active = 1;
		} else {
			active = 0;
		}

		var template = {
			id: req.params.mail_id,
			subject: subject,
			markup: message,
			active: active
		}

		Settings.updateEmailTemplate(template, function(err){
			if(err) {
				res.send("Something went wrong!");
			} else {
				res.send("Updated!");
			}
		});
	})
});

module.exports = router;