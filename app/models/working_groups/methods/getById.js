module.exports = function (WorkingGroups, sequelize, DataTypes) {
  return function (group_id, callback) {
    WorkingGroups.findOne({ where: { group_id: group_id } }).nodeify(callback);
  };
};
