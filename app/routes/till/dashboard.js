// /till/dashboard

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Tills = Models.Tills;
const TillActivity = Models.TillActivity;
const CarbonCategories = Models.CarbonCategories;
const StockCategories = Models.StockCategories;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get("/:till_id", Auth.isLoggedIn, Auth.canAccessPage("tills", "viewTill"), async (req, res) => {
	try {
    let till = await Tills.getById(req.params.till_id);
    if (!till) {
			throw "Till not found";
		}

		if (!(req.user.permissions.tills.viewTill == true || (req.user.permissions.tills.viewTill == "commonWorkingGroup" && req.user.working_groups.includes(till.group_id)))) {
			throw "You don't have permission to view this till";
		}

		const status = await TillActivity.getByTillId(till.till_id);
		till.status = status.opening;

		const categories = await StockCategories.getCategoriesByTillId(req.params.till_id, "tree");

		const till_id = req.query.till_id || null;
		let tillMode = false;
		if (till_id) {
			tillMode = true;
		}

		const carbonCategories = await CarbonCategories.getAll();

		res.render("till/dashboard", {
			tillMode: true,
			title: "Till Dashboard",
			tillsActive: true,
			tillDashboardActive: true,
			till: till,
			categories: categories,
			carbonCategories: carbonCategories,
			status: status,
			validConditions: Helpers.validItemConditions(),
			endDate: req.query.endDate || null,
			startDate: req.query.startDate || null
		});
	} catch (error) {
		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

		req.flash("error_msg", error);
		res.redirect(process.env.PUBLIC_ADDRESS + "/till/manage");
	}
});

module.exports = router;
