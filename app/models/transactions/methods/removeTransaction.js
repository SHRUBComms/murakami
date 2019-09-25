var moment = require("moment");
moment.locale("en-gb");

module.exports = function(Transactions, sequelize, DataTypes) {
  return function(transaction_id, callback) {
    var query =
      "DELETE FROM transactions WHERE transaction_id = ?; DELETE FROM carbon WHERE fx_transaction_id = ?;";
    var inserts = [transaction_id, transaction_id];
    sequelize.query(query, { replacements: inserts }).nodeify(callback);
  };
};
