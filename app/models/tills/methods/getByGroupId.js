module.exports = function(Tills, sequelize, DataTypes) {
  return function(group_id, callback) {
    Tills.findAll({ where: { group_id: group_id } }).nodeify(function(
      err,
      tills
    ) {
      callback(err, tills);
    });
  };
};
