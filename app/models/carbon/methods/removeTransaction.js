module.exports = function(Carbon, sequelize, DataTypes) {
  return function(fx_transaction_id, callback) {
    Carbon.destroy({where: {fx_transaction_id: fx_transaction_id}}).nodeify(callback)
  };
};
