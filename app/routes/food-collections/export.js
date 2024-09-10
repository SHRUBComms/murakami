// /food-collections/export

const router = require("express").Router();
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const FoodCollections = Models.FoodCollections;
const FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;
const Members = Models.Members;

const Auth = require(rootDir + "/app/controllers/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "export"),
  async (req, res) => {
    let startDate, endDate;
    try {
      startDate = moment(req.query.startDate).startOf("day").toDate();
    } catch (error) {
      startDate = moment().startOf("day").toDate();
    }

    try {
      endDate = moment(req.query.endDate).endOf("day").toDate();
    } catch (error) {
      endDate = moment().endOf("day").toDate();
    }

    let showCollections = false;
    let showDropoffs = false;

    if (req.query.type == "collections") {
      showCollections = true;
    } else if (req.query.type == "drop-offs") {
      showDropoffs = true;
    } else if (req.query.type == "both") {
      showCollections = true;
      showDropoffs = true;
    }

    if (!req.query.organisation_id) {
      showDropoffs = false;
    }

    const organisations = await FoodCollectionsOrganisations.getAll();
    const { membersObj } = await Members.getAll();
    const collections = await FoodCollections.getCollectionsBetweenTwoDatesByOrganisation(
      req.query.organisation_id,
      organisations,
      membersObj,
      startDate,
      endDate
    );
    const dropoffs = await FoodCollections.getDropOffsBetweenTwoDatesByOrganisation(
      req.query.organisation_id,
      organisations,
      membersObj,
      startDate,
      endDate
    );

    res.render("food-collections/export", {
      foodCollectionsActive: true,
      title: "Export Collections",
      organisation_id: req.query.organisation_id || null,
      startDate: moment(startDate).format("YYYY-MM-DD") || null,
      endDate: moment(endDate).format("YYYY-MM-DD") || null,
      organisations: organisations,
      collections: collections,
      dropoffs: dropoffs,
      showCollections: showCollections,
      showDropoffs: showDropoffs,
    });
  }
);

module.exports = router;
