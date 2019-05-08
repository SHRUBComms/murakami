// /food-collections/export

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var FoodCollections = Models.FoodCollections;
var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;
var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "export"),
  function(req, res) {
    Members.getAll(function(err, member, membersObj) {
      FoodCollections.getCollectionsBetweenTwoDatesByOrganisation(
        req.query.organisation_id,
        membersObj,
        req.query.startDate,
        req.query.endDate,
        function(err, collections) {
          FoodCollectionsOrganisations.getAll(function(err, organisations) {
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
  }
);

module.exports = router;
