// /food-collections/organisations/manage

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

const Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("foodCollections", "viewOrganisations"), async (req, res) => {
	const organisations = await FoodCollectionsOrganisations.getAll();
      	res.render("food-collections/organisations/manage", {
        	title: "Food Collection Organisations",
        	foodCollectionsActive: true,
        	organisations: organisations
      	});
});

module.exports = router;
