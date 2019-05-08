module.exports = function(VolunteerRoles, sequelize, DataTypes) {
  return function(role_id, callback) {
    VolunteerRoles.update(
      { public: 0, removed: 0 },
      { where: { role_id: role_id } }
    ).nodeify(callback);
  };
};
