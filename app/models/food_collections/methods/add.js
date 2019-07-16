module.exports = function(FoodCollections, sequelize, DataTypes) {
  return function(
    member_id,
    organisation_id,
    destination_organisation_id,
    amount,
    note,
    approved,
    callback
  ) {
    FoodCollections.generateId(function(transaction_id) {
      FoodCollections.create({
        transaction_id: transaction_id,
        member_id: member_id,
        organisation_id: organisation_id,
        destination_organisation_id: destination_organisation_id,
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
