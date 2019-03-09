// /food-collections/organisations/view

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var FoodCollections = require(rootDir + "/app/models/food-collections");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/:organisation_id", Auth.isLoggedIn, function(req, res) {
  FoodCollections.getOrganisationById(req.params.organisation_id, function(
    err,
    organisation
  ) {
    if (organisation) {
      FoodCollections.getCollectionsByOrganisationId(
        req.params.organisation_id,
        function(err, collections) {
          res.render("food-collections/organisations/view", {
            title: "View Food Collection Organisation",
            foodCollectionsActive: true,
            organisation: organisation,
            collections: collections
          });
        }
      );
    } else {
      res.redirect(
        process.env.PUBLIC_ADDRESS + "/food-collections/organisations/manage"
      );
    }
  });
});

module.exports = router;
