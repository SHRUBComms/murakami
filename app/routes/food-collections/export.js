// /food-collections/export

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var FoodCollections = require(rootDir + "/app/models/food-collections");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, Auth.isOfClass(["admin", "staff"]), function(
  req,
  res
) {
  FoodCollections.getCollectionsBetweenTwoDatesByOrganisation(
    req.query.organisation_id,
    req.query.startDate,
    req.query.endDate,
    function(err, collections) {
      FoodCollections.getOrganisations(function(err, organisations) {
        res.render("food-collections/export", {
          foodCollectionsActive: true,
          title: "Export Collections",
          organisation_id: req.query.organisation_id || null,
          startDate: req.query.startDate || null,
          endDate: req.query.endDate || null,
          organisations: organisations,
          collections: collections
        });
      });
    }
  );
});

module.exports = router;
