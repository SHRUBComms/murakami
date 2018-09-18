// /users

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");;
var Settings = require(rootDir + "/app/models/settings");;

var Auth = require(rootDir + "/app/configs/auth");

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

router.use("/add", require("./add"))
router.use("/view", require("./view"))
router.use("/update", require("./update"))
router.use("/deactivate", require("./deactivate"))

module.exports = router;