// /privacy

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");

const Settings = Models.Settings;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get("/", async (req, res) => {
	try {
		const privacyNotice = await Settings.getById("privacyNotice");
        	res.render("privacy", {
          		title: "Privacy Notice",
          		privacyNotice: privacyNotice.data
		});
	} catch (error) {
		res.redirect(process.env.PUBLIC_ADDRESS + "/error");
	}
});

module.exports = router;
