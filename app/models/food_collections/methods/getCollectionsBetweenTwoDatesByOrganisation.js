module.exports = function(FoodCollections, sequelize, DataTypes) {
  return function(organisation_id, membersObj, startDate, endDate, callback) {
    var query = {
      where: {
        approved: 1,
        timestamp: { [DataTypes.Op.between]: [startDate, endDate] }
      },
      order: [[timestamp, "DESC"]]
    };

    if (organisation_id) {
      query.where.organisation_id = organisation_id;
    }

    FoodCollections.findAll(query).nodeify(function(err, collections) {
      if (collections || !err) {
        var sanitizedCollections = [];
        async.each(
          collections,
          function(collection, callback) {
            FoodCollections.sanitizeCollection(collection, membersObj, function(
              sanitizedCollection
            ) {
              sanitizedCollections.push(sanitizedCollection);
              callback();
            });
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
