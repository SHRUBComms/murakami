module.exports = function(FoodCollections, sequelize, DataTypes) {
  return function(organisation_id, callback) {
    var Members = require(rootDir + "/app/models/sequelize").Members;
    FoodCollections.findAll({
      where: { organisation_id: organisation_id, approved: 1 },
      order: [[timestamp, "DESC"]]
    })
      .nodeify(function(collections) {
        if (collections) {
          Members.getAll(function(err, members, membersObj) {
            var sanitizedCollections = [];
            async.each(
              collections,
              function(collection, callback) {
                FoodCollections.sanitizeCollection(
                  collection,
                  membersObj,
                  function(sanitizedCollection) {
                    sanitizedCollections.push(sanitizedCollection);
                    callback();
                  }
                );
              },
              function() {
                callback(null, sanitizedCollections);
              }
            );
          });
        } else {
          callback(null, null);
        }
      })
      .catch(function(err) {
        callback(err, null);
      });
  };
};
