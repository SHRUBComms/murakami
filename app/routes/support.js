// /support

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const TillActivity = Models.TillActivity;

const Mail = require(rootDir + "/app/configs/mail/root");

router.get("/", async (req, res) => {
	// Check if till is open
  	const till_id = req.query.till_id;
	let tillMode = false;
	let till;
	let lastTillAction;
	if(till_id) {
		till = await Tills.getById(till_id);
		lastTillAction = await TillActivity.getByTillId(till.till_id);
		if (till.status) {
			till.status = lastTillAction.opening;
			tillMode = true;
		}
	} else {
		till = {};
	}

      	res.render("support", {
        	tillMode: tillMode,
        	till: till,
        	supportActive: true,
        	title: "Support"
      	});
});

router.post("/", async (req, res) => {

	const name = req.body.name;
	const email = req.body.email;
	const subject = req.body.subject;
	const message = req.body.message;

	try {
		// Validation form submission
		req.checkBody("name", "Please enter a name").notEmpty();
		req.checkBody("name", "Please enter a shorter name (<= 50 characters)").isLength({ max: 50 });

		req.checkBody("email", "Please enter an email address").notEmpty();
		req.checkBody("email", "Please enter a shorter email address (<= 89 characters)").isLength({ max: 89 });
		req.checkBody("email", "Please enter a valid email address").isEmail();

		req.checkBody("subject", "Please enter a subject line").notEmpty();
		req.checkBody("subject", "Please enter a shorter subject line (<= 100 characters)").isLength({ max: 100 });

		req.checkBody("message", "Please enter a message").notEmpty();
		req.checkBody("message", "Please enter a shorter message (<= 10000 characters)").isLength({ max: 10000 });

		// Parse request's body
		let errors = req.validationErrors();
		if (errors) {
			res.render("support", {
				title: "Support",
				errors: errors,
				name: name,
				email: email,
				subject: subject,
				message: message
			});
		} else {
			await Mail.sendSupport(name, email, subject, `Name: ${name}<br />Email: ${email}<br /><br />${message}`);
			req.flash("success_msg", "Message sent!");
        		res.redirect(process.env.PUBLIC_ADDRESS + "/support");
		}
	} catch (error) {
		console.log(error);
        	req.flash("error_msg", "Something went wrong! Please try again");
        	res.render("support", {
          		title: "Support",
          		name: name,
          		email: email,
          		subject: subject,
          		message: message
        	});
	}
});

module.exports = router;
