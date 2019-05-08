// /api/get/food-collections/deny

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");
var sanitizeHtml = require("sanitize-html");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var FoodCollections = Models.FoodCollections;
var VolunteerHours = Models.FoodCollections;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/:transaction_id",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "review"),
  function(req, res) {
    FoodCollections.getById(req.params.transaction_id, function(
      err,
      collection
    ) {
      if (collection.approved == null) {
        FoodCollections.denyCollection(req.params.transaction_id, function(
          err
        ) {
          if (!err) {
            res.send({ status: "ok", msg: "Collection denied!" });
          } else {
            res.send({ status: "fail", msg: "Something went wrong!" });
          }
        });
      } else {
        res.send({
          status: "fail",
          msg: "Collection has already been reviewed!"
        });
      }
    });
  }
);

module.exports = router;
