// /carbon-accounting/log

const router = require("express").Router();
const async = require("async");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Carbon = Models.Carbon;
const CarbonCategories = Models.CarbonCategories;
const WorkingGroups = Models.WorkingGroups;

const Auth = require(rootDir + "/app/controllers/auth");
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

router.get("/", Auth.isLoggedIn, Auth.canAccessPage("carbonAccounting", "log"), async (req, res) => {
	try {
		const carbonCategories = await CarbonCategories.getAll();

		const tillMode = (req.query.till_id) ? true : false;
		res.render("carbon-accounting/log", {
			tillMode: tillMode,
			till: {
				till_id: req.query.till_id,
				group_id: req.user.working_groups[0],
				status: 1
			},
			carbonActive: true,
			title: "Log Outgoing Weight",
			carbonCategories: Object.values(carbonCategories),
			working_groups: req.user.all_working_groups
		});

	} catch (error) {
		res.redirect(process.env.PUBLIC_ADDRESS + "/");
	}
});

router.post("/", Auth.isLoggedIn, Auth.canAccessPage("carbonAccounting", "log"), async (req, res) => {

	try {
		const transaction = req.body.transaction;
		let formattedTransaction = {};
		formattedTransaction.member_id = "anon";
		formattedTransaction.user_id = req.user.id;
		formattedTransaction.trans_object = {};
		formattedTransaction.amount = 0;

		if (req.user.permissions.carbonAccounting.log == true || (req.user.permissions.carbonAccounting.log == "commonWorkingGroup" && req.user.working_groups.includes(req.body.working_group))) {
			formattedTransaction.group_id = req.body.working_group;
		}

		formattedTransaction.method = req.body.method;

		const validDisposalMethods = [
			"recycled",
			"generated",
			"landfilled",
			"incinerated",
			"composted",
			"reused",
			"stored",
			"other"
		];

		if (!req.user.allWorkingGroups[formattedTransaction.group_id]) {
			throw "Please select a valid working group";
		}

		if (!validDisposalMethods.includes(formattedTransaction.method)) {
			throw "Please select a valid disposal method";
		}

		const carbonCategories = await CarbonCategories.getAll();

		for await (const entry of transaction) {
			if (isNaN(parseFloat(entry.weight))) {
				throw "Please make sure all entered weights are numbers";
			}

			if(entry.weight <= 0) {
				throw "Please make sure all entered weight are greater than 0";
			}

			if(!carbonCategories[entry.id]) {
				throw "Invalid category";
			}

			if (!formattedTransaction.trans_object[entry.id]) {
			      formattedTransaction.trans_object[entry.id] = entry.weight;
			} else {
			      formattedTransaction.trans_object[entry.id] = +entry.weight + +formattedTransaction.trans_object[entry.id];
			}
			formattedTransaction.amount += +formattedTransaction.trans_object[entry.id];
		}


		if (formattedTransaction.amount == 0) {
			throw "Total weight must be greater than 0";
		}

		await Carbon.add(formattedTransaction);

		const totalCarbon = await Helpers.calculateCarbon([formattedTransaction], carbonCategories);

		res.send({ status: "ok", msg: `Weight logged! ${Math.abs(totalCarbon * 1e-3).toFixed(2)}kg of carbon saved` });
	} catch (error) {
		console.log(error);
		if(typeof error != "string") {
			error = "Something went wrong! Please try again";
		}
		res.send({ status: "fail", msg: error });
	}
});

module.exports = router;
