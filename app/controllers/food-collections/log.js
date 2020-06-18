var lodash = require("lodash");

var rootDir = process.env.CWD;

var Models = require(rootDir + "/app/models/sequelize");
var FoodCollections = Models.FoodCollections;
var FoodCollectionsKeys = Models.FoodCollectionsKeys;
var FoodCollectionsOrganisations = Models.FoodCollectionsOrganisations;
var Members = Models.Members;
var VolunteerHours = Models.VolunteerHours;
var Settings = Models.Settings;

var Helpers = require(rootDir + "/app/helper-functions/root");

var ValidDropOffs = require("./valid-drop-offs");

var LogFoodCollection = function(req, res, foodCollectionKey, callback) {
  var member_id = req.body.member_id;
  var collectionOrganisation = req.body.collectionOrganisation;
  var destinationOrganisations = req.body.destinationOrganisations;
  var amount = req.body.amount;
  var note = req.body.note;

  if (!member_id) {
    callback("Please select a member");
    return;
  }

  if (!collectionOrganisation) {
    callback("Please select a collection organisation");
    return;
  }

  if (destinationOrganisations) {
    if (!Array.isArray(destinationOrganisations)) {
      destinationOrganisations = [destinationOrganisations];
    }
  } else {
    destinationOrganisations = [];
  }

  if (destinationOrganisations.length == 0) {
    callback("Please select at least one destination organisation");
    return;
  }

  if (isNaN(amount) || amount < 0.1) {
    callback("Please enter a valid amount");
    return;
  }

  Members.getById(
    member_id,
    { permissions: { members: { name: true } } },
    function(err, member) {
      if (!member || err) {
        callback("Member not found!");
        return;
      }

      FoodCollectionsOrganisations.getAll(function(err, allOrganisations) {
        FoodCollectionsOrganisations.getAllDefault(function(
          err,
          defaultOrganisations
        ) {
          if (foodCollectionKey) {
            var availableOrganisations = lodash.spread(lodash.union)([
              lodash.clone(foodCollectionKey.organisations),
              Object.keys(defaultOrganisations)
            ]);

            console.log("Default:", Object.keys(defaultOrganisations));
            console.log("Access key:", foodCollectionKey.organisations);
            console.log("Available:", availableOrganisations);
            console.log("Collections:", collectionOrganisation);
            console.log("Drop-offs:", destinationOrganisations);

            if (
              !Helpers.allBelongTo(
                collectionOrganisation,
                availableOrganisations
              ) ||
              !Helpers.allBelongTo(
                destinationOrganisations,
                availableOrganisations
              )
            ) {
              callback("You are not authorised to use these organisations.");
              return;
            }
          }

          if (!allOrganisations[collectionOrganisation]) {
            callback("Collection organisation doesn't exist.");
            return;
          }

          ValidDropOffs(allOrganisations, destinationOrganisations, function(
            allDropOffOrgsValid
          ) {
            if (!allDropOffOrgsValid) {
              callback("Please select valid drop off organisations.");
              return;
            }

            if (allOrganisations[collectionOrganisation].active == 0) {
              callback("Collection organisation is no longer active.");
              return;
            }

            if (
              !allOrganisations[collectionOrganisation].type.includes(
                "collections"
              )
            ) {
              callback(
                "The selected organisation is not a collection organisation."
              );
              return;
            }

            if (destinationOrganisations.includes(collectionOrganisation)) {
              callback(
                "Cannot collect and drop off from the same organisation."
              );
              return;
            }

            FoodCollections.add(
              member_id,
              collectionOrganisation,
              destinationOrganisations,
              amount,
              note,
              1,
              function(err) {
                if (err) {
                  console.log(err);
                  callback("Something went wrong!");
                  return;
                }

                Settings.getAll(function(err, settings) {
                  var shift = {
                    member_id: member_id,
                    duration: 1,
                    working_group: settings.foodCollectionsGroup.group_id,
                    note: "For food collection (automated)",
                    approved: 1
                  };

                  VolunteerHours.createShift(shift, function(err) {
                    if (err) {
                      callback(
                        "Collection logged, but something went wrong logging your volunteer hours"
                      );
                      return;
                    }
                    callback(null);
                    return;
                  });
                });
              }
            );
          });
        });
      });
    }
  );
};

module.exports = LogFoodCollection;
