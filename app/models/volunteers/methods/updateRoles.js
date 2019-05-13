module.exports = function(Volunteers, sequelize, DataTypes) {
  return function(member_id, roles, callback) {
    Volunteers.update({ roles: roles }, { where: { member_id: member_id } });
  };
};
