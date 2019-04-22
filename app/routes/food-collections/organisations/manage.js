// /food-collections/organisations/manage

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var FoodCollections = require(rootDir + "/app/models/food-collections");

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "viewOrganisations"),
  function(req, res) {
    FoodCollections.getOrganisations(function(err, organisations) {
      res.render("food-collections/organisations/manage", {
        title: "Food Collection Organisations",
        foodCollectionsActive: true,
        organisations: organisations
      });
    });
  }
);

module.exports = router;
