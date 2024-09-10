// /food-collections/organisations/view

const router = require("express").Router();

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const FoodCollections = Models.FoodCollections;
const Members = Models.Members;
const FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

const Auth = require(rootDir + "/app/controllers/auth");

router.get(
  "/:organisation_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "viewOrganisations"),
  async (req, res) => {
    try {
      const organisations = await FoodCollectionsOrganisations.getAll();

      if (!organisations[req.params.organisation_id]) {
        throw "Organisation not found";
      }

      const organisation = organisations[req.params.organisation_id];
      const { membersObj } = Members.getAll();
      const collections = await FoodCollections.getCollectionsByOrganisationId(
        req.params.organisation_id,
        organisations,
        membersObj
      );
      const dropoffs = await FoodCollections.getDropOffsByOrganisationId(
        req.params.organisation_id,
        organisations,
        membersObj
      );

      res.render("food-collections/organisations/view", {
        title: "View Food Collection Organisation",
        foodCollectionsActive: true,
        organisation: organisation,
        collections: collections,
        dropoffs: dropoffs,
      });
    } catch (error) {
      console.log(error);
      res.redirect(process.env.PUBLIC_ADDRESS + "/food-collections/organisations/manage");
    }
  }
);

module.exports = router;
