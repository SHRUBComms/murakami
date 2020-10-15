// /login

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");

const Users = Models.Users;
const Activity = Models.Activity;
const Settings = Models.Settings;

passport.use(
  	new LocalStrategy(
    		{
      			usernameField: "username",
      			passwordField: "password",
      			passReqToCallback: true
    		},
    		async (req, username, password, done) => {
			try {
				const user = await Users.getByUsernameOrEmail(username);
				if (user) {

					// If user associated with username or email exists:
					// * Check if account is locked (>5 unsuccessful login attempts in last hour)
					// * Check if password is correct
					// * Record login attempt

					let loginActivityRecord = {
						user_id: user.id,
						action: "login",
						details: {
							ip_address: req.headers["x-forwarded-for"] || req.connection.remoteAddress
						}
					}

					const failedAttemptsQuery = {
						where: {
							user_id: user.id,
							action: "login",
							createdAt: {
								[Models.Sequelize.Op.gte]: moment().subtract(60, "minutes").toDate()
							},
							details: { outcome: 0 }
						}
					};

					const failedAttempts = await Activity.findAll(failedAttemptsQuery);
					if (failedAttempts.length <= 100) {
						const passwordCorrect = await Users.comparePassword(password, user.password);
						if (passwordCorrect) {
							loginActivityRecord.details.outcome = 1;
							await Activity.create(loginActivityRecord);
							return done(null, user);
						} else {
							loginActivityRecord.details.outcome = 0;
							await Activity.create(loginActivityRecord);
							return done(null, false, { message: "Wrong password!" });
						}
					} else {
						return done(null, false, { message: "This account has been temporarily locked due to too many unsuccessful login attempts. Try again in 1 hour." });
					}
				} else {
					return done(null, false, { message: "Account not found!" });
				}
			} catch(error) {
				return done(null, false, { message: "Something went wrong! Please try again" });
			}

		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await Users.getById(id, { id: id });
		if(!user) {
			throw "User not found";
		}
		done(null, user)
	} catch(error) {
		return done(null, error);
	}
});

router.post(
  	"/",
  	passport.authenticate("local", {
    		failureRedirect: "/login",
    		badRequestMessage: "Please enter your details",
    		failureFlash: true
  	}),
  	(req, res) => {
    		res.redirect(process.env.PUBLIC_ADDRESS + "/");
  	}
);

router.get("/", async (req, res) => {
	if (req.user) {
		res.redirect(process.env.PUBLIC_ADDRESS + "/");
	} else {
    		const settings = await Settings.getAll();
      		res.render("login", {
        		loginActive: true,
        		title: "Login",
        		settings: settings
      		});
	}
});

module.exports = router;
