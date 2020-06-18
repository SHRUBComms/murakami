// /api/post/volunteers/food-collections/get-by-member-id

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

var Auth = require(rootDir + "/app/configs/auth");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "manageFoodCollectionLink"),
  function(req, res) {
    FoodCollectionsOrganisations.getAll(function(err, organisations) {
      if (!err && organisations) {
        res.send({
          status: "ok",
          organisations: organisations
        });
      } else {
        res.send({
          status: "fail",
          msg: "Something went wrong!"
        });
      }
    });
  }
);

module.exports = router;
