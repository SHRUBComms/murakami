module.exports = function (FoodCollectionsOrganisations, sequelize, DataTypes) {
  return async () => {
    const query = `SELECT * FROM food_collections_organisations
				LEFT JOIN (
					SELECT collection_organisation_id collections_organisation_id, MAX(timestamp) lastCollection FROM food_collections GROUP BY collection_organisation_id
				)
				collections ON food_collections_organisations.organisation_id=collections.collections_organisation_id
				ORDER BY food_collections_organisations.active DESC`;
    try {
      const organisations = await sequelize.query(query);
      return organisations[0].reduce(
        (obj, item) => Object.assign(obj, { [item.organisation_id]: item }),
        {}
      );
    } catch (error) {
      throw error;
    }
  };
};
