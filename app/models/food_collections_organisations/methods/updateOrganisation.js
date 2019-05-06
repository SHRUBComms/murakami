module.exports = function(FoodCollectionsOrganisations, sequelize, DataTypes) {
  return function(organisation, callback) {
    FoodCollectionsOrganisations.update(
      { name: organisation.name },
      { where: { organisation_id: organisation.organisation_id } }
    ).nodeify(function(err) {
      callback(err);
    });
  };
};
