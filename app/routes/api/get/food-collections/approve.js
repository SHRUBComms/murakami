// /api/get/food-collections/approve

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");
var sanitizeHtml = require("sanitize-html");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");

var FoodCollections = Models.FoodCollections;
var VolunteerHours = Models.VolunteerHours;
var Members = Models.Members;
var Settings = Models.Settings;

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
        FoodCollections.approveCollection(req.params.transaction_id, function(
          err
        ) {
          if (!err) {
            Settings.getAll(function(err, settings) {
              var shift = {
                member_id: collection.member_id,
                duration: 1,
                working_group: settings.foodCollectionsGroup.group_id,
                note: "For food collection (automated)",
                approved: 1
              };

              VolunteerHours.createShift(shift, function(err) {
                if (!err) {
                  res.send({ status: "ok", msg: "Collection approved!" });
                } else {
                  res.send({
                    status: "fail",
                    msg:
                      "Collection approved, but something went wrong logging the hours volunteered"
                  });
                }
              });
            });
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
