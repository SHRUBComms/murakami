module.exports = function(FoodCollectionsOrganisations, sequelize, DataTypes) {
  return function(organisation_id, callback) {
    var query =
      "SELECT * FROM food_collections_organisations LEFT JOIN (SELECT organisation_id collections_organisation_id, MAX(timestamp) lastCollection FROM food_collections GROUP BY organisation_id) collections ON food_collections_organisations.organisation_id=collections.collections_organisation_id WHERE food_collections_organisations.organisation_id = ?";

    sequelize
      .query(query, { replacements: [organisation_id] })
      .nodeify(function(err, organisation) {
        console.log(err);
        if (organisation[0][0]) {
          callback(err, organisation[0][0]);
        } else {
          callback(err, null);
        }
      });
  };
};
