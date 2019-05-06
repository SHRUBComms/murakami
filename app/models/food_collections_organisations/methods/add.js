module.exports = function(FoodCollectionsOrganisations, sequelize, DataTypes) {
  return function(organisation, callback) {
    Helpers.uniqueBase64Id(15, "fs_organisations", "organisation_id", function(
      organisation_id
    ) {
      FoodCollectionsOrganisations.create({
        organisation_id: organisation_id,
        name: organisation.name,
        dateCreated: new Date()
      }).nodeify(function(err) {
        callback(err, organisation_id);
      });
    });
  };
};
