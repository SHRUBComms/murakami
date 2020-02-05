// /api/post/volunteers/food-collections/get-by-member-id

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;
var FoodCollectionsKeys = Models.FoodCollectionsKeys;
var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

var Auth = require(rootDir + "/app/configs/auth");
var Helpers = require(rootDir + "/app/helper-functions/root");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "manageFoodCollectionLink"),
  function(req, res) {
    var organisations = req.body.organisations;
    var member_id = req.body.member_id;

    var response = { status: "fail" };

    FoodCollectionsOrganisations.getAll(function(err, allOrganisations) {
      console.log(allOrganisations);
      if (Array.isArray(organisations)) {
        if (
          !Helpers.allBelongTo(organisations, Object.keys(allOrganisations))
        ) {
          organisations = [];
        }
      } else {
        organisations = [];
      }
      FoodCollectionsKeys.getByMemberId(member_id, function(
        err,
        foodCollectionKey
      ) {
        if (!err && foodCollectionKey) {
          foodCollectionKey.organisations = organisations;
          foodCollectionKey.active = 1;

          FoodCollectionsKeys.updateKey(foodCollectionKey, function(err) {
            if (!err) {
              response.status = "ok";
              response.msg = "Food collections link updated!";
              response.key = foodCollectionKey.key;
              res.send(response);
            } else {
              response.msg = "Something went wrong!";
              res.send(response);
            }
          });
        } else {
          foodCollectionKey = {
            member_id: member_id,
            organisations: organisations,
            active: 1
          };
          FoodCollectionsKeys.createKey(foodCollectionKey, function(err, key) {
            if (!err) {
              response.status = "ok";
              response.msg = "Food collections link updated!";
              response.key = key;
              res.send(response);
            } else {
              response.msg = "Something went wrong!";
              res.send(response);
            }
          });
        }
      });
    });
  }
);

module.exports = router;
