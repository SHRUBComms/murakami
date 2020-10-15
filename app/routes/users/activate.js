// /users/activate

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Users = Models.Users;
const AccessTokens = Models.AccessTokens;

const Auth = require(rootDir + "/app/configs/auth");
const Mail = require(rootDir + "/app/configs/mail/root");
const Helpers = require(rootDir + "/app/helper-functions/root");

router.get("/:user_id", Auth.isLoggedIn, Auth.canAccessPage("users", "deactivate"), async (req, res) => {
	let activationToken;
	let activationLink;
	try {
		const user = await Users.getById(req.params.user_id, req.user);

		if(!user) {
			throw "User not found!";
		}

		if(user.deactivated = 0) {
			throw "User already activated";
		}

		if(!user.canDeactivate) {
			throw "You're not permitted to activate this user";
		}

		let validClasses = [];
		if (req.user.class == "admin") {
			validClasses = ["admin", "staff", "volunteer", "till"];
		} else {
			validClasses = ["till", "volunteer"];
		}

		if (!validClasses.includes(user.class)) {
			throw "You can't activate a user of a higher class"
		}

		const existingActivationTokenQuery = {
			where: {
				used: 0,
				expirationTimestamp: {
					[Models.Sequelize.Op.gte]: moment().toDate()
				},
				details: { user_id: user.id }
			}
		}

		const existingActivationToken = await AccessTokens.findOne(existingActivationTokenQuery);

		if(existingActivationToken) {
			throw "An activation link has already been issued!";
		}

		const expirationTimestamp = moment().add(7, "days").toDate();

		activationToken = await AccessTokens.createInvite(expirationTimestamp, { action: "add-user", invitedBy: req.user.id, user_id: user.id });

		if(!activationToken) {
			throw "Something went wrong! Please try again";
		}

		activationLink = process.env.PUBLIC_ADDRESS + "/users/invite/" + activationToken;

		const mailRecipient = `${user.first_name} ${user.last_name} <${user.email}>`;
		const message = `<p>Hey ${user.first_name}</p>
				<p>You've been invited to Murakami by ${req.user.first_name} ${req.user.last_name}!</p>
				<p>Please follow the link below to complete your registration. It will expire at <b>${moment(expirationTimestamp).format("L hh:mm A")}</b>.</p>
				<p><a href="${activationLink}">${activationLink}</a></p>`;

		await Mail.sendGeneral(mailRecipient, "Murakami Invite", message);

		req.flash("success_msg", "Invite sent successfully!");
		res.redirect(process.env.PUBLIC_ADDRESS + "/users/update/" + user.id);
	} catch (error) {

		console.log(error);

		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

		if(activationToken) {
			error = "Something went wrong sending the email! Please send the activation link manually: " + activationLink;
		}

		req.flash("error_msg", error);
		res.redirect(process.env.PUBLIC_ADDRESS + "/users/update/" + req.params.user_id);
	}
})

module.exports = router;
