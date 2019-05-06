module.exports = function(Carbon, sequelize, DataTypes) {
  return function(callback) {
    Carbon.findAll({
      where: sequelize.where(
        sequelize.fn("YEAR", sequelize.col("trans_date")),
        moment().toDate()
      )
    }).nodeify(function(err, carbon) {
      callback(err, carbon);
    });
  };
};
