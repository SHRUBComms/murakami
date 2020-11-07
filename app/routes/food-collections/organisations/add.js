// /food-collections/organisations/add

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const FoodCollections = Models.FoodCollections;
const FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");
const Auth = require(rootDir + "/app/controllers/auth");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("foodCollections", "addOrganisations"), (req, res) => {
	res.render("food-collections/organisations/add", {
      		title: "Add Food Collection Organisations",
      		foodCollectionsActive: true
    	});
});

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("foodCollections", "addOrganisations"), async (req, res) => {
	try {
		const organisation = req.body.organisation;

		let formattedOrganisation = {};

		if (organisation.name) {
			formattedOrganisation.name = organisation.name;
		} else {
			throw "Please enter an organisation name";
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

		if (formattedOrganisation.type.length < 1) {
			throw "Please select at least one type";
		}

		const organisationId = await FoodCollectionsOrganisations.add(formattedOrganisation);

		req.flash("success_msg", "Organisation successfully added!");
		res.redirect(process.env.PUBLIC_ADDRESS + "/food-collections/organisations/view/" + organisationId);

	} catch (error) {
		console.log(error);
		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

            	res.render("food-collections/organisations/add", {
              		errors: [{ msg: error }],
              		title: "Add Food Collection Organisations",
              		foodCollectionsActive: true,
              		organisation: req.body.organisation
            	});
        }
});

module.exports = router;
