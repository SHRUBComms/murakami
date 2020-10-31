// /till/manage

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const TillActivity = Models.TillActivity;

const Auth = require(rootDir + "/app/configs/auth");
const Helpers = require(rootDir + "/app/helper-functions/root");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("tills", "viewTill"), async (req, res) => {
	try {
		const { tills } = await Tills.getAll();
		const activity = await TillActivity.getAll();

		let allowedTills = [];

		for await (const till of tills) {
			if (req.user.permissions.tills.viewTill == true || (req.user.permissions.tills.viewTill == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id))) {
				allowedTills.push(till);
			}
		}

		res.render("till/manage", {
			title: "Manage Tills",
			tillsActive: true,
			tills: allowedTills,
			activity: activity
		});

	} catch (error) {
		console.log(error);
		res.redirect(process.env.PUBLIC_ADDRESS + "/error");
	}
});

module.exports = router;
