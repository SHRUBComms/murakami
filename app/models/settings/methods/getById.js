module.exports = function(Settings, sequelize, DataTypes) {
  return function(id, callback) {
    Settings.findOne({ where: { id: id } }).nodeify(function(err, settings) {
      callback(err, settings);
    });
  };
};
