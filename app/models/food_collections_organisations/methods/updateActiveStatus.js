module.exports = (FoodCollectionsOrganisations, sequelize, DataTypes) => {
  return async (organisation_id, active) => {
    return FoodCollectionsOrganisations.update(
      { active: active },
      { where: { organisation_id: organisation_id } }
    );
  };
};
