var moment = require("moment");
moment.locale("en-gb");

module.exports = function(Transactions, sequelize, DataTypes) {
  return function(transaction_id, callback) {
    Transactions.destroy({where: {transaction_id: transaction_id}}).nodeify(callback)
  };
};
