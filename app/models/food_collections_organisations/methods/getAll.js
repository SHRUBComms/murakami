var async = require("async");

module.exports = function(FoodCollectionsOrganisations, sequelize, DataTypes) {
  return function(callback) {
    var query =
      "SELECT * FROM fs_organisations LEFT JOIN (SELECT organisation_id collections_organisation_id, MAX(timestamp) lastCollection FROM food_collections GROUP BY organisation_id) collections ON fs_organisations.organisation_id=collections.collections_organisation_id ORDER BY fs_organisations.active DESC";

    sequelize.query(query).nodeify(function(organisations, err) {
      var organisationsObj = {};
      async.each(
        organisations,
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
