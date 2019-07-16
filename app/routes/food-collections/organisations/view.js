// /food-collections/organisations/view

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var FoodCollections = Models.FoodCollections;
var Members = Models.Members;
var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:organisation_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "viewOrganisations"),
  function(req, res) {
    FoodCollectionsOrganisations.getAll(function(err, organisations) {
      if (organisations[req.params.organisation_id]) {
        var organisation = organisations[req.params.organisation_id];
        Members.getAll(function(err, membersArray, membersObj) {
          FoodCollections.getCollectionsByOrganisationId(
            req.params.organisation_id,
            organisations,
            membersObj,
            function(err, collections) {
              FoodCollections.getDropOffsByOrganisationId(
                req.params.organisation_id,
                organisations,
                membersObj,
                function(err, dropoffs) {
                  res.render("food-collections/organisations/view", {
                    title: "View Food Collection Organisation",
                    foodCollectionsActive: true,
                    organisation: organisation,
                    collections: collections,
                    dropoffs: dropoffs
                  });
                }
              );
            }
          );
        });
      } else {
        res.redirect(
          process.env.PUBLIC_ADDRESS + "/food-collections/organisations/manage"
        );
      }
    });
  }
);

module.exports = router;
