// /users/invite

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Users = Models.Users;
const AccessTokens = Models.AccessTokens;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");
const Mail = require(rootDir + "/app/controllers/mail/root");
const validateUser = require(rootDir + "/app/controllers/users/validateUser");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("users", "add"), (req, res) => {
	res.render("users/invite", {
    		title: "Invite User",
    		usersActive: true,
    		callback: req.query.callback || null
  	});
});

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("users", "add"), async (req, res) => {
	let activationToken, activationLink;
	try {
		if (!Array.isArray(req.body.working_groups)) {
			req.body.working_groups = [req.body.working_groups];
		}

		const submittedFormValid = await validateUser(req.user, req.body);

		const usernameInUse = await Users.getByUsername(req.body.username);
		if(usernameInUse) {
			throw "Username is already in use";
		}

		const emailInUse = await Users.getByEmail(req.body.email);
		if(emailInUse) {
			throw "Email address is already in use";
		}

		const blankNotificationPreferences = {
			"pending-volunteer-hours": {
				email: "off",
				murakami: "off"
			},
			"volunteers-need-to-volunteer": {
				email: "off",
				murakami: "off"
			},
			"unfinished-roles": {
				email: "off",
				murakami: "off"
			}
		};

		let newUser = {
			id: null,
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			username: req.body.username,
			email: req.body.email,
			class: req.body.class,
			working_groups: req.body.working_groups.sort(),
			notification_preferences: blankNotificationPreferences
		};

		const userId = await Users.add(newUser);

		const expirationTimestamp = moment().add(7, "days").toDate();
		activationToken = await AccessTokens.createInvite(expirationTimestamp, { action: "add-user", invitedBy: req.user.id, user_id: userId });

		activationLink = process.env.PUBLIC_ADDRESS + "/users/invite/" + activationToken;

		const mailRecipient = `${newUser.first_name} ${newUser.last_name} <${newUser.email}>`;
		const message = `<p>Hey ${newUser.first_name}</p>
				<p>You've been invited to Murakami by ${req.user.first_name} ${req.user.last_name}!</p>
				<p>Please follow the link below to complete your registration. It will expire at <b>${moment(expirationTimestamp).format("L hh:mm A")}</b>.</p>
				<p><a href="${activationLink}">${activationLink}</a></p>`

		await Mail.sendGeneral(mailRecipient, "Murakami Invite", message);
		req.flash("success_msg", "Invite sent successfully!");
		res.redirect(process.env.PUBLIC_ADDRESS + "/users/invite?callback=true");

	} catch (error) {
		console.log(error);
		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

		if(activationToken) {
			error = "Something went wrong sending the email! Please send the activation link manually: " + activationLink;
		}

                res.render("users/invite", {
                	errors: [{ msg: error }],
                  	title: "Invite User",
                  	usersActive: true,
                  	first_name: req.body.first_name,
                  	last_name: req.body.last_name,
                  	username: req.body.username,
                  	email: req.body.email,
                  	working_groups: req.body.working_groups,
                  	class: req.body.class
                });
	}
});

router.get("/:token", Auth.isNotLoggedIn, async (req, res) => {

	try {
		const invite = await AccessTokens.getById(req.params.token);
		if (!invite) {
			throw "Invalid Invite";
		}

		const user = await Users.getById(invite.details.user_id, { permissions: { users: { name: true } } });

		if (!user) {
			throw "Invite Malformed";
		}

		if(user.deactivated == 0) {
			throw "Invite Used";
		}

		if(invite.details.action != "add-user") {
			throw "Invite Malformed";
		}

		if (invite.used == 1) {
			throw "Invite Used";
		}

		if (!moment(invite.expirationTimestamp).isAfter(moment())) {
			throw "Invite Expired";
		}

		res.render("reset", {
			title: "Complete Registration",
			invite: invite,
			viewedUser: user
		});
	} catch (error) {
		console.log(error);
		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

		res.render("error", {
                	title: error,
                });
	}
});

router.post("/:token", Auth.isNotLoggedIn, async (req, res) => {
	const password = req.body.password;
	const passwordConfirm = req.body.passwordConfirm;
	try {
		const invite = await AccessTokens.getById(req.params.token);
		if (!invite) {
			throw "Invalid Invite";
		}

		const user = await Users.getById(invite.details.user_id, { permissions: { users: { name: true } } });

		if (!user) {
			throw "Invite Malformed";
		}

		if(user.deactivated == 0) {
			throw "Invite Used";
		}

		if(invite.details.action != "add-user") {
			throw "Invite Malformed";
		}

		if (invite.used == 1) {
			throw "Invite Used";
		}

		if (!moment(invite.expirationTimestamp).isAfter(moment())) {
			throw "Invite Expired";
		}


		if (!password) {
			throw "Please enter a new password"
		}

		if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) {
			throw "Please enter a valid password";
		}

		if(!passwordConfirm) {
			throw "Please confirm your password";
		}

		if (password != passwordConfirm) {
			throw "Passwords don't match";
		}

		await Users.updatePassword(user.id, password);
                await Users.update({ deactivated: 0 }, { where: { id: user.id } });
                await AccessTokens.markAsUsed(invite.token);

                const userInvitedBy = await Users.getById(invite.details.invitedBy, {permissions: { users: { name: true, email: true } } });
		const mailRecipient = `${userInvitedBy.first_name} ${userInvitedBy.last_name} <${userInvitedBy.email}>`;
		const message = `<p>Hey ${userInvitedBy.first_name},</p>
				<p>This email is to notify you that ${user.first_name} ${user.last_name} has activated their acount using your invite.</p>
				<p>If you didn't invite this user, please <a href="${process.env.PUBLIC_ADDRESS}/users/update/${user.id}">deactivate the account</a> and <a href="${process.env.PUBLIC_ADDRESS}/support">contact support</a> <b>as soon as possible</b></p>`
                Mail.sendGeneral(mailRecipient, "Murakami Account Activated", message);

                req.flash("success_msg", "Password set! You can now login.");
                res.redirect(process.env.PUBLIC_ADDRESS + "/login");
	} catch (error) {
		console.log(error);
		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

		req.flash("error_msg", error);
		res.redirect(process.env.PUBLIC_ADDRESS + "/users/invite/" + req.params.token);
	}
});

module.exports = router;
