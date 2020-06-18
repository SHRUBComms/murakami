var async = require("async");

module.exports = function(FoodCollections, sequelize, DataTypes) {
  return function(
    organisation_id,
    organisations,
    membersObj,
    startDate,
    endDate,
    callback
  ) {
    var query = {
      where: {
        approved: 1,
        timestamp: {
          [DataTypes.Op.between]: [startDate, endDate]
        }
      },
      order: [["timestamp", "DESC"]]
    };

    FoodCollections.findAll(query).nodeify(function(err, collections) {
      if (collections || !err) {
        var sanitizedCollections = [];
        async.each(
          collections,
          function(collection, callback) {
            if (
              collection.destination_organisations.includes(organisation_id)
            ) {
              FoodCollections.sanitizeCollection(
                collection,
                organisations,
                membersObj,
                function(sanitizedCollection) {
                  sanitizedCollections.push(sanitizedCollection);
                  callback();
                }
              );
            } else {
              callback();
            }
          },
          function() {
            callback(err, sanitizedCollections);
          }
        );
      } else {
        callback(err, []);
      }
    });
  };
};
