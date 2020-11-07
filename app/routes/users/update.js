// /users/update

const router = require("express").Router();
const async = require("async");
const lodash = require("lodash");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Users = Models.Users;
const WorkingGroups = Models.WorkingGroups;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");
const validateUser = require(rootDir + "/app/controllers/users/validateUser");
const sanitizeNotificationPreferences = require(rootDir + "/app/controllers/users/sanitizeNotificationPreferences");


router.get("/:user_id", Auth.isLoggedIn, Auth.canAccessPage("users", "view"), async (req, res) => {
	try {
		const user = await Users.getById(req.params.user_id, req.user);
		if(!user) {
			throw "User not found!";
		}

		if (!user.canUpdate) {
			throw "You don't have permission to view or update this user"
		}

		res.render("users/update", {
		    usersActive: true,
		    title: "Update User",
		    viewedUser: user
		});
	} catch (error) {

		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

		req.flash("error_msg", error);
		res.redirect(process.env.PUBLIC_ADDRESS + "/error");
	}
})

router.post("/:user_id", Auth.isLoggedIn, Auth.canAccessPage("users", "update"), async (req, res) => {
	try {
		if (!Array.isArray(req.body.working_groups)) {
			req.body.working_groups = [req.body.working_groups];
		}

		const user = await Users.getById(req.params.user_id, req.user);
		const isUser = (req.user.id == req.params.user_id) ? true : false;

		if (!user.canUpdate) {
			throw "You don't have permission to update this user"
		}

		req.user.working_groups.push(user.working_groups);
		req.user.working_groups = lodash.uniq(req.user.working_groups);
		req.body.email = user.email;
		req.body.username = user.username;
		const submittedFormValid = await validateUser(req.user, req.body);

		let updatedUser = { user_id: req.params.user_id, class: req.body.class };

		if (req.user.permissions.users.name || isUser) {
		      	updatedUser.first_name = req.body.first_name;
		      	updatedUser.last_name = req.body.last_name;
		} else {
		      	updatedUser.first_name = user.first_name;
		      	updatedUser.last_name = user.last_name;
		}

		if (req.user.permissions.users.workingGroups || isUser) {
			updatedUser.working_groups = req.body.working_groups.sort();
		} else {
		      	updatedUser.working_groups = user.working_groups.sort();
		}

		if(isUser) {
			const sanitizedNotificationPreferences = await sanitizeNotificationPreferences(req.body.notification_preferences);
			if(sanitizedNotificationPreferences == false) {
				updatedUser.notification_preferences = user.notification_preferences;
			} else {
				updatedUser.notification_preferences = sanitizedNotificationPreferences;
			}
		} else {
			updatedUser.notification_preferences = user.notification_preferences;
		}

		await Users.updateUser(updatedUser);

		req.flash("success_msg", "User updated!");
		res.redirect(process.env.PUBLIC_ADDRESS + "/users/update/" + req.params.user_id);

	} catch (error) {

		console.log(error);
		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

		req.flash("error_msg", error);
		res.redirect(process.env.PUBLIC_ADDRESS + "/users/update/" + req.params.user_id);
	}
});

module.exports = router;
