// /food-collections/log

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const FoodCollections = Models.FoodCollections;
const FoodCollectionsKeys = Models.FoodCollectionsKeys;
const FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;
const Members = Models.Members;
const VolunteerHours = Models.VolunteerHours;
const Settings = Models.Settings;

const LogFoodCollection = require(rootDir + "/app/controllers/food-collections/log");

const Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("foodCollections", "log"), async (req, res) => {

	try {
		const allOrganisations = await FoodCollectionsOrganisations.getAll();
		const { membersObj } = await Members.getAll();
		res.render("food-collections/log", {
			title: "Log Food Collection",
			foodCollectionsActive: true,
			allOrganisations: allOrganisations,
			members: membersObj
		});
	} catch (error) {
		res.redirect(process.env.PUBLIC_ADDRESS + "/error");
	}
});

router.get("/:key", Auth.isNotLoggedIn, async (req, res) => {
	try {
		const foodCollectionKey = await FoodCollectionsKeys.getById(req.params.key);

		if (!foodCollectionKey) {
			throw "Your link isn't valid! Please get in touch with your co-ordinator";
		}

		if (foodCollectionKey.active == 0) {
			throw "Your link has been disabled! Please get in touch with your co-ordinator.";
		}

		const member = await Members.getById(foodCollectionKey.member_id, { permissions: { members: { name: true } } });

		if(!member) {
			throw "Your link isn't valid! Please get in touch with your co-ordinator";
		}

		const allOrganisations = await FoodCollectionsOrganisations.getAll();

		res.render("food-collections/log", {
			title: "Log Food Collection",
			foodCollectionsActive: true,
			foodCollectionKey: foodCollectionKey,
			allOrganisations: allOrganisations,
			member: member
		});

	} catch (error) {

		console.log(error);

		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

		res.render("error", {
			title: "Error",
			specificError: { message: error }
		})
	}
});

router.post("/:key", Auth.isNotLoggedIn, async (req, res) => {
	try {
		const foodCollectionKey = await FoodCollectionsKeys.getById(req.params.key);

		if (!foodCollectionKey) {
			throw "Your link isn't valid! Please get in touch with your co-ordinator";
		}

		if (foodCollectionKey.active == 0) {
			throw "Your link has been disabled! Please get in touch with your co-ordinator.";
		}

		await LogFoodCollection(req, res, foodCollectionKey);

		req.flash("success_msg", "Collection & shift successfully logged!");
		res.redirect(process.env.PUBLIC_ADDRESS + "/food-collections/log/" + req.params.key);
	} catch (error) {

		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}

            	req.flash("error_msg", error);
            	res.redirect(process.env.PUBLIC_ADDRESS + "/food-collections/log/" + req.params.key);
	}
});

module.exports = router;
