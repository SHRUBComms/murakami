module.exports = function(FoodCollectionsOrganisations, sequelize, DataTypes) {
  return function(organisation_id, active, callback) {
    FoodCollectionsOrganisations.update(
      { active: active },
      { where: { organisation_id: organisation_id } }
    )
      .then(function() {
        callback(null);
      })
      .catch(function(err) {
        callback(err);
      });
  };
};
