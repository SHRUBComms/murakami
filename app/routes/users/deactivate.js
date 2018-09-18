// /users/deactivate

var router = require("express").Router();

var rootDir = process.env.CWD;

var Users = require(rootDir + "/app/models/users");
var Settings = require(rootDir + "/app/models/settings");

var Auth = require(rootDir + "/app/configs/auth");

router.get('/:user_id', Auth.isLoggedIn, Auth.isAdmin, function (req, res) {

	Users.getById(req.params.user_id, function(err, user){
		if(user[0] && !err){
			var user = user[0]
			if(user.admin == 0) {
				Users.deactivate(user.id, function(err){
					if(err){
						req.flash("error", "Something went wrong!")
						res.redirect("/users/update/" + user.id);							
					} else {
						req.flash("success_msg", "User deactivated!")
						res.redirect("/users");
					}
				})
			} else {
				req.flash("error", "You can't deactivate an admin.")
				res.redirect("/users");				
			}
		} else {
			req.flash("error", "No user found.")
			res.redirect("/users");
		}
	})
});

module.exports = router;