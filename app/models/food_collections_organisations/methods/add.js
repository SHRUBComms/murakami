module.exports = function(FoodCollectionsOrganisations, sequelize, DataTypes) {
  return function(organisation, callback) {
    FoodCollectionsOrganisations.generateId(function(organisation_id) {
      FoodCollectionsOrganisations.create({
        organisation_id: organisation_id,
        name: organisation.name,
        type: organisation.type,
        default: organisation.default,
        dateCreated: new Date()
      }).nodeify(function(err) {
        callback(err, organisation_id);
      });
    });
  };
};
