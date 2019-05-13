module.exports = function(VolunteerRoles, sequelize, DataTypes) {
  return function(role_id, callback) {
    VolunteerRoles.findOne({ where: { role_id: role_id } }).nodeify(function(
      err,
      role
    ) {
      if (role) {
        if (Object.keys(role.details).length == 1) {
          role.incomplete = true;
        } else {
          role.incomplete = false;
        }

        role.availability = role.availability || {};

        callback(err, role);
      } else {
        callback(err, null);
      }
    });
  };
};
