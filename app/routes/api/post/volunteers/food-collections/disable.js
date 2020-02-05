// /api/post/volunteers/food-collections/disable

var router = require("express").Router();
var async = require("async");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;
var FoodCollectionsKeys = Models.FoodCollectionsKeys;

var Auth = require(rootDir + "/app/configs/auth");

router.post(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("volunteers", "manageFoodCollectionLink"),
  function(req, res) {
    var response = { status: "fail" };

    var member_id = req.body.member_id;
    FoodCollectionsKeys.getByMemberId(member_id, function(
      err,
      foodCollectionKey
    ) {
      if (!err && foodCollectionKey) {
        if (foodCollectionKey.active == 1) {
          foodCollectionKey.active = 0;
          FoodCollectionsKeys.updateKey(foodCollectionKey, function(err) {
            if (!err) {
              response.status = "ok";
              response.msg = "Food collection link disabled.";
              res.send(response);
            } else {
              response.msg = "Something went wrong! Please try again.";
              res.send(response);
            }
          });
        } else {
          response.msg = "Link already disabled.";
          res.send(response);
        }
      } else {
        response.msg = "Volunteer doesn't have a food collection link.";
        res.send(response);
      }
    });
  }
);

module.exports = router;
