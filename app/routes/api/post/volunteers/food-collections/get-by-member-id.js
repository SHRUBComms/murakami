// /api/post/volunteers/food-collections/get-by-member-id

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;
var FoodCollectionsKeys = Models.FoodCollectionsKeys;
var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;

var Auth = require(rootDir + "/app/configs/auth");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "manageFoodCollectionLink"),
  function(req, res) {
    var member_id = req.body.member_id;
    Members.getById(member_id, req.user, function(err, member) {
      if (!err && member) {
        FoodCollectionsKeys.getByMemberId(member_id, function(
          err,
          foodCollectionKey
        ) {
          FoodCollectionsOrganisations.getAll(function(err, organisations) {
            if (!err && foodCollectionKey) {
              res.send({
                status: "ok",
                foodCollectionKey: foodCollectionKey,
                organisations: organisations
              });
            } else {
              res.send({
                status: "ok",
                msg: "Food collection key not found!",
                organisations: organisations,
                foodCollectionKey: { organisations: [] }
              });
            }
          });
        });
      } else {
        res.send({ status: "fail", msg: "Member not found!" });
      }
    });
  }
);

module.exports = router;
