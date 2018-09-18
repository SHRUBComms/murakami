// /users/update

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var Settings = require(rootDir + "/app/models/settings");
var WorkingGroups = require(rootDir + "/app/models/working-groups")

var Auth = require(rootDir + "/app/configs/auth")

router.get('/:user_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {

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

router.post('/:user_id', Auth.isLoggedIn, Auth.isAdmin, function(req, res){
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
				    		admin_wg: JSON.stringify(formattedWorkingGroups.sort())
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