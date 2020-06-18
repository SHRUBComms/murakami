module.exports = function(FoodCollections, sequelize, DataTypes) {
  return function(
    member_id,
    collectionOrganisation,
    destinationOrganisations,
    amount,
    note,
    approved,
    callback
  ) {
    FoodCollections.generateId(function(transaction_id) {
      FoodCollections.create({
        transaction_id: transaction_id,
        member_id: member_id,
        collection_organisation_id: collectionOrganisation,
        destination_organisations: destinationOrganisations,
        amount: amount,
        note: note || null,
        timestamp: new Date(),
        approved: approved
      }).nodeify(function(err) {
        callback(err, transaction_id);
      });
    });
  };
};
