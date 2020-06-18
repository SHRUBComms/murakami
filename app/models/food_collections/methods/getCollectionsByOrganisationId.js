var async = require("async");

module.exports = function(FoodCollections, sequelize, DataTypes) {
  return function(organisation_id, organisations, membersObj, callback) {
    FoodCollections.findAll({
      where: { collection_organisation_id: organisation_id, approved: 1 },
      order: [["timestamp", "DESC"]]
    }).nodeify(function(err, collections) {
      if (collections) {
        var sanitizedCollections = [];
        async.each(
          collections,
          function(collection, callback) {
            FoodCollections.sanitizeCollection(
              collection,
              organisations,
              membersObj,
              function(sanitizedCollection) {
                sanitizedCollections.push(sanitizedCollection);
                callback();
              }
            );
          },
          function() {
            callback(err, sanitizedCollections);
          }
        );
      } else {
        callback(err, null);
      }
    });
  };
};
