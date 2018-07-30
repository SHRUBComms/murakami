// Import resources
var express = require('express');
var router = express.Router();
var app = express();
var async = require("async");

var Users = require("../models/users");
var Settings = require("../models/settings");
var Auth = require("../configs/auth");
var WorkingGroups = require("../models/working-groups")

router.get('/', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
	Users.getAll(function(err, users){
		Settings.getAll(function(err, settings){
			settings = settings[0];
			settings.definitions = JSON.parse(settings.definitions)

			if(err) throw err;
			async.eachOf(users, function(user, i, callback){
				Users.makeNice(user, settings, function(user){
					users[i] = user;
					callback();
				});
			}, function (err) {
				res.render('users/all', {
				  	title: "Users",
				  	users: users,
				  	usersActive: true
				});
			});
		});
	});
});

router.get('/add', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
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

router.post('/add', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {
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
	//req.checkBody("username", "Please enter a valid username").matches();

	req.checkBody("email", "Please enter an email address").notEmpty();
	req.checkBody("email", "Please enter a shorter email address (<= 89 characters)").isLength({max: 89});
	req.checkBody("email", "Please enter a valid email address").isEmail();

	req.checkBody("password", "Please enter a password").notEmpty();
	req.checkBody("password", "Please enter a shorter password (<= 255 characters)").isLength({max: 255});
	
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
			admin_wg: JSON.stringify(formattedWorkingGroups),
			password: password,
			passwordConfirm: passwordConfirm
		};

		Users.add(newUser, function(err, user){
			if(err) throw err;
			user = user[0]
			req.flash('success_msg', 'New user added!');
			res.redirect('/users/update/' + user.id);	    		
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

router.get("/change-password", Auth.isLoggedIn, Auth.isAdmin, function(req, res){
  req.logout();
  req.session = null;
  res.redirect('/recover');
})


router.get('/update/:user_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {

	Users.getById(req.params.user_id, function(err, user){
		if(err || !user[0]){
			req.flash('error_msg', 'User not found!');
			res.redirect('/users');
		} else {
			Settings.getAll(function(err, settings){
				settings = settings[0];
				settings.definitions = JSON.parse(settings.definitions)

				Users.makeNice(user[0], settings, function(user){
					res.render('users/update', {
					  	title: "Update User",
					  	usersActive: true,
						user_id: req.params.user_id,
						full_name: user.full_name,
						first_name: user.first_name,
						last_name: user.last_name,
						email: user.email,
						username: user.username,
						admin: user.admin,
						working_groups: user.working_groups,
						last_login: user.last_login,
						settings: settings
					});	

				});			
			})
		}	
	});
});

router.post('/update/:user_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
	Users.getById(req.params.user_id, function(err, user){
		if(err || !user[0]) {
			req.flash('error_msg', 'Something went wrong, please try again!');
			res.redirect('/users/update/' + req.params.user_id);
		} else {

			var first_name = req.body.first_name.trim();
			var last_name = req.body.last_name.trim();
			var admin = req.body.admin;
			var working_groups = [];

			if(req.body.working_groups){
				var working_groups = JSON.parse(req.body.working_groups);
			}

			// Validation
			req.checkBody("first_name", "Please enter a first name").notEmpty();
			req.checkBody("first_name", "Please enter a shorter first name (<= 20 characters)").isLength({max: 20});

			req.checkBody("last_name", "Please enter a last name").notEmpty();
			req.checkBody("last_name", "Please enter a shorter last name (<= 30 characters)").isLength({max: 30});

			if(admin == "on") {
				admin = 1;
			} else {
				admin = 0;
			}

			// Parse request's body
			var errors = req.validationErrors();
		    if(errors) {
		    	req.flash('error_msg', 'Something went wrong!');
		    	res.redirect('/users/update/' + req.params.user_id);
		    } else {

				var formattedWorkingGroups = []

				Settings.getAll(function(err, settings){
					settings = settings[0];
					settings.definitions = JSON.parse(settings.definitions)

					async.eachOf(working_groups, function(working_groups, key, callback) {
						WorkingGroups.verifyGroupById(key, settings, function(group){
							if(group){
								formattedWorkingGroups.push(key);
							}
							callback()
						})
					}, function(err){
				    	var updatedUser = {
				    		user_id: req.params.user_id,
				    	 	first_name: first_name,
				    		last_name: last_name,
				    		admin: admin,
				    		admin_wg: JSON.stringify(formattedWorkingGroups)
				    	};

				    	console.log(updatedUser);

						Users.update(updatedUser, function(err, user){
							if(err) throw err;

							req.flash('success_msg', 'User updated!');
							res.redirect('/users/update/' + req.params.user_id);
						});
					});
				});
		    }
		}
	});
});

module.exports = router;