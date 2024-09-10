module.exports = function (Volunteers, sequelize, DataTypes) {
  return function (member_id, active, callback) {
    Volunteers.update({ active: active }, { where: { member_id: member_id } }).nodeify(
      function (err) {
        callback(err);
      }
    );
  };
};
