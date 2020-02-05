module.exports = function(FoodCollectionsOrganisations, sequelize, DataTypes) {
  return function(organisation, callback) {
    FoodCollectionsOrganisations.update(
      {
        name: organisation.name,
        type: organisation.type,
        default: organisation.default
      },
      { where: { organisation_id: organisation.organisation_id } }
    ).nodeify(function(err) {
      callback(err);
    });
  };
};
