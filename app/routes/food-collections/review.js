// /food-collections/review

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
  Auth.canAccessPage("foodCollections", "review"),
  function(req, res) {
    res.render("food-collections/review", {
      title: "Review Food Collection",
      foodCollectionsActive: true
    });
  }
);

module.exports = router;
