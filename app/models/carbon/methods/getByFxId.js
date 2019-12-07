module.exports = function(Carbon, sequelize, DataTypes) {
  return function(fx_transaction_id, callback) {
    Carbon.findAll({ where: { fx_transaction_id: fx_transaction_id } }).nodeify(
      function(err, carbon) {
        callback(null, carbon);
      }
    );
  };
};
