var async = require("async");

module.exports = function(FoodCollectionsOrganisations, sequelize, DataTypes) {
  return function(callback) {
    var query =
      "SELECT * FROM food_collections_organisations LEFT JOIN (SELECT collection_organisation_id collections_organisation_id, MAX(timestamp) lastCollection FROM food_collections GROUP BY collection_organisation_id) collections ON food_collections_organisations.organisation_id=collections.collections_organisation_id ORDER BY food_collections_organisations.active DESC";

    sequelize.query(query).nodeify(function(err, organisations) {
      var organisationsObj = {};

      async.each(
        organisations[0],
        function(organisation, callback) {
          organisationsObj[organisation.organisation_id] = organisation;
          callback();
        },
        function() {
          callback(err, organisationsObj);
        }
      );
    });
  };
};
