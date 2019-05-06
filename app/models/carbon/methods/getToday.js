module.exports = function(Carbon, sequelize, DataTypes) {
  return function(callback) {
    Carbon.findAll({
      where: sequelize.where(
        sequelize.fn("DATE", sequelize.col("trans_date")),
        new Date()
      )
    }).then(function(err, carbon) {
      callback(err, carbon);
    });
  };
};
