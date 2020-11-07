// /till/open

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const TillActivity = Models.TillActivity;
const WorkingGroups = Models.WorkingGroups;

const Auth = require(rootDir + "/app/controllers/auth");
const validateFloat = require(rootDir + "/app/controllers/tills/activity/validateFloat");

router.get("/:till_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "open"), async (req, res) => {
	try {
		const till = await Tills.getById(req.params.till_id);

		if (!till) {
			throw "Till not found";
		}

		if (till.disabled == 1) {
			throw "Till is disabled";
		}

		if (!(req.user.permissions.tills.open == true || (req.user.permissions.tills.open == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
			throw "You are not permitted to open this till";
		}

		const status = await TillActivity.getByTillId(req.params.till_id);

		if (status.opening == 1) {
			throw "Till is already open";
		}

		const group = req.user.allWorkingGroups[till.group_id];

		res.render("till/open", {
			tillMode: true,
			openTillActive: true,
			title: "Open Till",
			till: till,
			allWorkingGroups: req.user.allWorkingGroups,
			working_group: group
		});

	} catch (error) {

		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

		req.flash("error_msg", error);
		res.redirect(process.env.PUBLIC_ADDRESS + "/till/dashboard/" + req.params.till_id);
	}
});

router.post("/:till_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "open"), async (req, res) => {
  	try {
		await validateFloat(req.body);

		const till = await Tills.getById(req.params.till_id);

		if (!till) {
			throw "Till not found";
		}

		if (till.disabled == 1) {
			throw "Till is disabled";
		}

		if (!(req.user.permissions.tills.open == true || (req.user.permissions.tills.open == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
			throw "You are not permitted to open this till";
		}

		const status = await TillActivity.getByTillId(req.params.till_id);

		if (status.opening == 1) {
			throw "Till is already open";
		}

              	await TillActivity.open(req.params.till_id, req.body.counted_float, req.user.id, req.body.note);

                res.redirect(process.env.PUBLIC_ADDRESS + "/till/transaction/" + req.params.till_id);
        } catch (error) {
          if(typeof error != "string") {
            console.log(error);
			error = "Something went wrong! Please try again";
		}

		req.flash("error_msg", error);
              	res.redirect(process.env.PUBLIC_ADDRESS + "/till/open/" + req.params.till_id);

	}
});
module.exports = router;
