module.exports = function (FoodCollectionsOrganisations, sequelize, DataTypes) {
  return function (organisation_id, callback) {
    FoodCollectionsOrganisations.update(
      { active: 0 },
      { where: { organisation_id: organisation_id } }
    ).nodeify(function (err) {
      callback(err);
    });
  };
};
