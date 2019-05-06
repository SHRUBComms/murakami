module.exports = function(FoodCollections, sequelize, DataTypes) {
  return function(
    member_id,
    organisation_id,
    amount,
    note,
    approved,
    callback
  ) {
    Helpers.uniqueBase64Id(15, "food_collections", "transaction_id", function(
      transaction_id
    ) {
      FoodCollections.create({
        transaction_id: transaction_id,
        member_id: member_id,
        organisation_id: organisation_id,
        amount: amount,
        note: note || null,
        timestamp: new Date(),
        approved: approved
      })
        .then(function(err) {
          callback(null, transaction_id);
        })
        .catch(function(err) {
          callback(err, null);
        });
    });
  };
};
