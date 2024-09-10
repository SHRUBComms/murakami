module.exports = function (VolunteerRoles, sequelize, DataTypes) {
  return function (role_id, public, callback) {
    VolunteerRoles.update({ public: public }, { where: { role_id: role_id } }).nodeify(callback);
  };
};
