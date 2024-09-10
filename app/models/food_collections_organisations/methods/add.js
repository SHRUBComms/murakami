module.exports = (FoodCollectionsOrganisations, sequelize, DataTypes) => {
  return async (organisation) => {
    try {
      const organisation_id = await FoodCollectionsOrganisations.generateId();
      await FoodCollectionsOrganisations.create({
        organisation_id: organisation_id,
        name: organisation.name,
        type: organisation.type,
        default: organisation.default,
        dateCreated: new Date(),
      });
      return organisation_id;
    } catch (error) {
      throw error;
    }
  };
};
