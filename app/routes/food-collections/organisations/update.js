// /food-collections/organisations/update

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const FoodCollections = Models.FoodCollections;
const FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

const Helpers = require(rootDir + "/app/helper-functions/root");
const Auth = require(rootDir + "/app/configs/auth");

router.get("/:organisation_id", Auth.isLoggedIn, Auth.canAccessPage("foodCollections", "updateOrganisations"), async (req, res) => {
	try {
    		const organisation = await FoodCollectionsOrganisations.getById(req.params.organisation_id);

		if (!organisation) {
			throw "Organisation not found!"
		}

		res.render("food-collections/organisations/update", {
          		title: "Update Food Collection Organisation",
          		foodCollectionsActive: true,
          		organisation: organisation
        	});

      	} catch (error) {
        	res.redirect(process.env.PUBLIC_ADDRESS + "/food-collections/organisations/manage");
      	}
});

router.post("/:organisation_id", Auth.isLoggedIn, Auth.canAccessPage("foodCollections", "updateOrganisations"), async (req, res) => {
	try {
		const organisationFound = await FoodCollectionsOrganisations.getById(req.params.organisation_id);
		if (!organisationFound) {
			throw "Organisation not found!"
		}

		const organisation = req.body.organisation;

		let formattedOrganisation = {
		  organisation_id: req.params.organisation_id
		};

		if (organisation.name) {
			formattedOrganisation.name = organisation.name;
		} else {
			formattedOrganisation.name = organisationFound.name;
		}

		if (organisation.default) {
			formattedOrganisation.default = true;
		} else {
			formattedOrganisation.default = false;
		}

		const validTypes = ["drop-offs", "collections"];

		if (!Array.isArray(organisation.type)) {
			organisation.type = [organisation.type];
		}

		if (Helpers.allBelongTo(organisation.type, validTypes)) {
			formattedOrganisation.type = organisation.type;
		} else {
			formattedOrganisation.type = [];
		}

		if (organisation.type.length > 0) {
			formattedOrganisation.type = organisation.type;
		} else {
			formattedOrganisation.type = organisationFound.type;
		}

		await FoodCollectionsOrganisations.updateOrganisation(formattedOrganisation);

		req.flash("success_msg", "Organisation successfully updated!");
		res.redirect(process.env.PUBLIC_ADDRESS +"/food-collections/organisations/view/" + req.params.organisation_id);
	} catch (error) {

		if(typeof error == "string") {
			error = "Something went wrong! Please try again"
		}

		req.flash("error_msg", error);
		res.redirect(process.env.PUBLIC_ADDRESS +"/food-collections/organisations/update/" + req.params.organisation_id);
	}
});
module.exports = router;
