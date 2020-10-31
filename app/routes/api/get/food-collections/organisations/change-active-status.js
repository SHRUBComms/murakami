// /api/get/food-collections/organisations/change-active-status

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

const Auth = require(rootDir + "/app/configs/auth");

router.get("/:organisation_id", Auth.isLoggedIn, Auth.canAccessPage("foodCollections", "updateOrganisations"), async (req, res) => {
	try {
		if(!["active", "inactive"].includes(req.query.newStatus)) {
			throw "Invalid active status";
		}

		const newStatus = req.query.newStatus == "active" ? 1 : 0;

		const organisation = await FoodCollectionsOrganisations.getById(req.params.organisation_id);

		if (!organisation) {
			throw "Organisation not found";
		}

		if (organisation.active == newStatus) {
			throw "Active status unchanged";
		}

		await FoodCollectionsOrganisations.updateActiveStatus(req.params.organisation_id, newStatus);

		req.flash("success_msg", organisation.name + " active status updated!");
		res.redirect(process.env.PUBLIC_ADDRESS + "/food-collections/organisations/view/" + req.params.organisation_id);
	} catch (error) {
		console.log(error);
		if(typeof error == "string") {
			error = "Something went wrong! Please try again";
		}

		req.flash("error_msg", error);
		res.redirect(process.env.PUBLIC_ADDRESS + "/food-collections/organisations/view/" + req.params.organisation_id);
	}
});

module.exports = router;
