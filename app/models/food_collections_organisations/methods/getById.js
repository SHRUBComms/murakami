module.exports = function(FoodCollectionsOrganisations, sequelize, DataTypes) {
  return function(organisation_id, callback) {
    var query =
      "SELECT * FROM food_collections_organisations LEFT JOIN (SELECT collection_organisation_id AS organisation_id, MAX(timestamp) AS lastCollection FROM food_collections GROUP BY organisation_id) collections ON food_collections_organisations.organisation_id=collections.organisation_id WHERE food_collections_organisations.organisation_id = ?";

    sequelize
      .query(query, { replacements: [organisation_id] })
      .nodeify(function(err, organisation) {
        if (organisation[0][0]) {
          callback(err, organisation[0][0]);
        } else {
          callback(err, null);
        }
      });
  };
};
