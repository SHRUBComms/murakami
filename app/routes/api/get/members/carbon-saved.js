// /api/get/members/carbon-saved

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Carbon = Models.Carbon;
const CarbonCategories = Models.CarbonCategories;
const Members = Models.Members;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get("/:member_id", Auth.isLoggedIn, Auth.canAccessPage("members", "carbonSaved"), async (req, res) => {
	try {
		const member = await Members.getById(req.params.member_id, req.user);
		if (!member) {
			throw "Member not found";
		}

		if (!member.canViewSavedCarbon) {
			throw "Not permitted"
		}

		const carbon = await Carbon.getByMemberId(req.params.member_id);

		if (carbon.length == 0) {
			throw "No carbon savings";
		}

		const carbonCategories = await CarbonCategories.getAll();
		let totalCarbon = await Helpers.calculateCarbon(carbon, carbonCategories);
		totalCarbon = totalCarbon * 1e-3; // Convert to grams to kilos
		res.send({ carbon: Math.abs(totalCarbon.toFixed(2)) || 0 });
	} catch (error) {
		res.send({ carbon: 0 });
	}
});

module.exports = router;
