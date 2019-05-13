module.exports = function(Settings, sequelize, DataTypes) {
  return function(id, data, callback) {
    Settings.update({ data: data }, { where: { id: id } }).nodeify(function(
      err
    ) {
      callback(err);
    });
  };
};
