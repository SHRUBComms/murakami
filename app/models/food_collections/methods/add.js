module.exports = (FoodCollections, sequelize, DataTypes) => {
  	return async (member_id, collectionOrganisation, destinationOrganisations, amount, note, approved) => {
    		const transaction_id = await FoodCollections.generateId();
      		await FoodCollections.create({
        		transaction_id: transaction_id,
        		member_id: member_id,
        		collection_organisation_id: collectionOrganisation,
        		destination_organisations: destinationOrganisations,
        		amount: amount,
        		note: note || null,
        		timestamp: new Date(),
        		approved: approved
		});

		return transaction_id;
	}
}
