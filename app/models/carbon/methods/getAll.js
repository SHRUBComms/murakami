module.exports = function(Carbon, sequelize, DataTypes) {
  return function(callback) {
    Carbon.findAll({}).nodeify(function(err, carbon) {
      callback(err, carbon);
    });
  };
};
