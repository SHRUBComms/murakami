const lodash = require("lodash");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const FoodCollections = Models.FoodCollections;
const FoodCollectionsKeys = Models.FoodCollectionsKeys;
const FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;
const Members = Models.Members;
const VolunteerHours = Models.VolunteerHours;
const Settings = Models.Settings;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

const ValidDropOffs = require("./valid-drop-offs");

const LogFoodCollection = async (req, res, foodCollectionKey) => {

	try {
		const member_id = req.body.member_id;
		const collectionOrganisation = req.body.collectionOrganisation;
		let destinationOrganisations = req.body.destinationOrganisations;
		const amount = req.body.amount;
		const note = req.body.note;

		if (!member_id) {
			throw "Please select a member";
		}

		if (!collectionOrganisation) {
			throw "Please select a collection organisation";
		}

		if (destinationOrganisations) {
			if (!Array.isArray(destinationOrganisations)) {
				destinationOrganisations = [destinationOrganisations];
			}
		} else {
			destinationOrganisations = [];
		}

		if (destinationOrganisations.length == 0) {
			throw "Please select at least one destination organisation";
		}

		if (isNaN(amount) || amount < 0.1) {
			throw "Please enter a valid amount";
		}

		const member = await Members.getById(member_id, { permissions: { members: { name: true } } });

		if (!member) {
			throw "Member not found!";
		}

		const allOrganisations = await FoodCollectionsOrganisations.getAll();
		const defaultOrganisations = await FoodCollectionsOrganisations.getAllDefault();

		const availableOrganisations = lodash.spread(lodash.union)([lodash.clone(foodCollectionKey.organisations), Object.keys(defaultOrganisations)]);


		if (!Helpers.allBelongTo(collectionOrganisation, availableOrganisations) || !Helpers.allBelongTo(destinationOrganisations, availableOrganisations)) {
			throw "You are not authorised to use these organisations.";
		}

		if (!allOrganisations[collectionOrganisation]) {
		    throw "Collection organisation doesn't exist.";
		}

		const allDropOffOrgsValid = await ValidDropOffs(allOrganisations, destinationOrganisations);

		if (!allDropOffOrgsValid) {
		      throw "Please select valid drop off organisations.";
		}

		if (allOrganisations[collectionOrganisation].active == 0) {
		      throw "Collection organisation is no longer active.";
		}

		if (!allOrganisations[collectionOrganisation].type.includes("collections")) {
		      throw "The selected organisation is not a collection organisation.";
		}

		if (destinationOrganisations.includes(collectionOrganisation)) {
			throw "Cannot collect and drop off from the same organisation."
		}

		await FoodCollections.add(member_id, collectionOrganisation, destinationOrganisations, amount, note, 1);

		const settings = await Settings.getAll();
		const shift = {
			member_id: member_id,
			duration: 1,
			working_group: settings.foodCollectionsGroup.data.group_id,
			note: "For food collection (automated)",
			approved: 1
		};

		await VolunteerHours.createShift(shift);
		return true;
	} catch (error) {
		console.log(error);
		throw error;
	}
};

module.exports = LogFoodCollection;
