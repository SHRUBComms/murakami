// /food-collections/review

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var FoodCollections = require(rootDir + "/app/models/food-collections");
var Members = require(rootDir + "/app/models/members");

var Auth = require(rootDir + "/app/configs/auth");

router.get("/", Auth.isLoggedIn, function(req, res) {
  res.render("food-collections/review", {
    title: "Review Food Collection",
    foodCollectionsActive: true
  });
});

module.exports = router;
