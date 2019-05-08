module.exports = function(Transactions, sequelize, DataTypes) {
  var Helpers = require(process.env.CWD + "/app/configs/helpful_functions");
  var GetId = function(callback) {
    var id = Helpers.generateBase64Id(25);
    Transactions.findAll({ where: { transaction_id: id } }).nodeify(function(
      err,
      result
    ) {
      if (result.length > 0) {
        GetId(callback);
      } else if (result.length == 0) {
        callback(id);
      }
    });
  };
  return GetId;
};
