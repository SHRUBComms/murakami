module.exports = function(Volunteers, sequelize, DataTypes) {
  return function(member_id, assignedCoordinators, callback) {
    Volunteers.update(
      { assignedCoordinators: assignedCoordinators },
      { where: { member_id: member_id } }
    ).nodeify(callback);
  };
};
