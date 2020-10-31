module.exports = (FoodCollectionsOrganisations, sequelize, DataTypes) => {
	return async (organisation) => {
    		return FoodCollectionsOrganisations.update({
			name: organisation.name,
        		type: organisation.type,
        		default: organisation.default
      		},
      		{ where: { organisation_id: organisation.organisation_id } });
	}
};
