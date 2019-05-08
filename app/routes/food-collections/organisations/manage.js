// /food-collections/organisations/manage

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "viewOrganisations"),
  function(req, res) {
    FoodCollectionsOrganisations.getAll(function(err, organisations) {
      res.render("food-collections/organisations/manage", {
        title: "Food Collection Organisations",
        foodCollectionsActive: true,
        organisations: organisations
      });
    });
  }
);

module.exports = router;
