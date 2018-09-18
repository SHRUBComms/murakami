// /users/add

var router = require("express").Router();

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var Settings = require(rootDir + "/app/models/settings");
var WorkingGroups = require(rootDir + "/app/models/working-groups")

var Auth = require(rootDir + "/app/configs/auth");

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
	Settings.getAll(function(err, settings){
		settings = settings[0];
		settings.definitions = JSON.parse(settings.definitions);
		res.render('users/add', {
		  	title: "Add User",
		  	usersActive: true,
		  	settings: settings,
		  	working_groups: {}
		});	
	})
});

router.post('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
	var first_name = req.body.first_name.trim();
	var last_name = req.body.last_name.trim();
	var username = req.body.username.trim();
	var email = req.body.email.trim();
	var admin = req.body.admin;
	var password = req.body.password;
	var passwordConfirm = req.body.passwordConfirm;
	if(req.body.working_groups){
		var working_groups = JSON.parse(req.body.working_groups);
	}

	// Validation
	if(username){
		req.check("username", "This username is already in use! Please enter something different").isUsernameAvailable();
	}
	if(email){
		req.check("email", "This email address is already in use! Please enter something different").isEmailAvailable();
	}

	req.checkBody("first_name", "Please enter a first name").notEmpty();
	req.checkBody("first_name", "Please enter a shorter first name (<= 20 characters)").isLength({max: 20});

	req.checkBody("last_name", "Please enter a last name").notEmpty();
	req.checkBody("last_name", "Please enter a shorter last name (<= 30 characters)").isLength({max: 30});

	req.checkBody("username", "Please enter a username").notEmpty();
	req.checkBody("username", "Please enter a shorter username (<= 20 characters)").isLength({max: 20});
	req.checkBody("username", "Please enter a valid username").matches(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/);

	req.checkBody("email", "Please enter an email address").notEmpty();
	req.checkBody("email", "Please enter a shorter email address (<= 89 characters)").isLength({max: 89});
	req.checkBody("email", "Please enter a valid email address").isEmail();

	req.checkBody("password", "Please enter a password").notEmpty();
	req.checkBody("password", "Please enter a valid password (between 6 and 255 characters)").isLength({min: 6, max: 255});
	
    if(req.body.password){
    	req.assert('passwordConfirm', 'Passwords do not match').equals(req.body.password);
    }

	if(admin == "on") {
		admin = 1;
	} else {
		admin = 0;
	}


	var formattedWorkingGroups = []

	Settings.getAll(function(err, settings){
		settings = settings[0]
		settings.definitions = JSON.parse(settings.definitions);
		Object.keys(working_groups).forEach(function(key) {
			WorkingGroups.verifyGroupById(key, settings, function(group){
				if(group){
					formattedWorkingGroups.push(key); 
				}
			})
		});
	});

	// Parse request's body asynchronously
	req.asyncValidationErrors().then(function() {
		var newUser = {
			id: null,
			first_name: first_name,
			last_name: last_name,
			username: username,
			email: email,
			admin: admin,
			admin_wg: JSON.stringify(formattedWorkingGroups.sort()),
			password: password,
			passwordConfirm: passwordConfirm
		};

		Users.add(newUser, function(err, user){
			if(err) throw err;
			user = user[0]
			req.flash('success_msg', 'New user added!');
			res.redirect('/users/view/' + user.id);	    		
		});

    }).catch(function(errors) {
		Settings.getAll(function(err, settings){
			settings = settings[0];
			settings.definitions = JSON.parse(settings.definitions);
			res.render('users/add',{
				errors: errors,
				title: "Add User",
				usersActive: true,
				first_name: first_name,
				last_name: last_name,
				username: username,
				email: email,
				admin: admin,
				password: password,
				passwordConfirm: passwordConfirm,
				settings: settings,
				working_groups: working_groups
			});
		});
    });

});

module.exports = router;