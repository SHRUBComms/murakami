// /carbon-accounting/settings

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Carbon = Models.Carbon;
const CarbonCategories = Models.CarbonCategories;

const Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("carbonAccounting", "settings"), async (req, res) => {
    	const carbonCategories = await CarbonCategories.getAll();
	res.redirect(process.env.PUBLIC_ADDRESS + "/carbon-accounting/settings/" + carbonCategories[Object.keys(carbonCategories)[0]].carbon_id);
});

router.get("/:carbon_id", Auth.isLoggedIn, Auth.canAccessPage("carbonAccounting", "settings"), async (req, res) => {
	const carbonCategories = await CarbonCategories.getAll();
      	const carbon_id = req.params.carbon_id;
      	if (carbonCategories[carbon_id]) {
        	res.render("carbon-accounting/settings", {
          		title: "Carbon Accounting Settings",
          		carbonActive: true,
          		carbonCategories: carbonCategories,
          		selectedCategory: carbonCategories[carbon_id]
        	});
	} else {
      		res.redirect(process.env.PUBLIC_ADDRESS + "/error");
      	}
});

router.post("/:carbon_id", Auth.isLoggedIn, Auth.canAccessPage("carbonAccounting", "settings"), async (req, res) => {
	const factors = req.body.factors;
	const carbon_id = req.params.carbon_id;

        const validDisposalMethods = [
          	"recycled",
          	"generated",
          	"landfilled",
          	"incinerated",
          	"composted",
          	"reused",
          	"stored"
        ];

	try {
		const category = await CarbonCategories.getById(carbon_id);

		if(!category) {
			throw new Error;
		}

		for await (const disposalMethod of Object.keys(category.factors)) {
			if(validDisposalMethods.includes(disposalMethod) && !isNaN(factors[disposalMethod])) {
				category.factors[disposalMethod] = factors[disposalMethod] || 0;
			}
		}

		await CarbonCategories.updateCategory(category);

		req.flash("success_msg", "Settings successfully updated");
		res.redirect(process.env.PUBLIC_ADDRESS + "/carbon-accounting/settings/" + carbon_id);

	} catch(error) {
		console.log(error);
		if(typeof error != "string") {
			error = "Something went wrong! Please try again"
		}

		req.flash("error_msg", error);
		res.redirect(process.env.PUBLIC_ADDRESS + "/carbon-accounting/settings/" + carbon_id);
	}
});

module.exports = router;
