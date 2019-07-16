// /food-collections/export

var router = require("express").Router();
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var FoodCollections = Models.FoodCollections;
var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;
var Members = Models.Members;

var Auth = require(rootDir + "/app/configs/auth");

router.get(
  "/",
  Auth.isLoggedIn,
  Auth.canAccessPage("foodCollections", "export"),
  function(req, res) {
    var startDate, endDate;
    try {
      startDate = moment(req.query.startDate)
        .startOf("day")
        .toDate();
    } catch (err) {
      startDate = moment()
        .startOf("day")
        .toDate();
    }

    try {
      endDate = moment(req.query.endDate)
        .endOf("day")
        .toDate();
    } catch (err) {
      endDate = moment()
        .endOf("day")
        .toDate();
    }

    var showCollections,
      showDropoffs = false;

    if (req.query.type == "collections") {
      showCollections = true;
    } else if (req.query.type == "drop-offs") {
      showDropoffs = true;
    } else if (req.query.type == "both") {
      showCollections = true;
      showDropoffs = true;
    }

    if (!req.query.organisation_id) {
      showDropoffs = false;
    }

    FoodCollectionsOrganisations.getAll(function(err, organisations) {
      Members.getAll(function(err, member, membersObj) {
        FoodCollections.getCollectionsBetweenTwoDatesByOrganisation(
          req.query.organisation_id,
          organisations,
          membersObj,
          startDate,
          endDate,
          function(err, collections) {
            FoodCollections.getDropOffsBetweenTwoDatesByOrganisation(
              req.query.organisation_id,
              organisations,
              membersObj,
              startDate,
              endDate,
              function(err, dropoffs) {
                res.render("food-collections/export", {
                  foodCollectionsActive: true,
                  title: "Export Collections",
                  organisation_id: req.query.organisation_id || null,
                  startDate: moment(startDate).format("YYYY-MM-DD") || null,
                  endDate: moment(endDate).format("YYYY-MM-DD") || null,
                  organisations: organisations,
                  collections: collections,
                  dropoffs: dropoffs,
                  showCollections: showCollections,
                  showDropoffs: showDropoffs
                });
              }
            );
          }
        );
      });
    });
  }
);

module.exports = router;
