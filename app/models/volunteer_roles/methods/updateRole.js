module.exports = function(VolunteerRoles, sequelize, DataTypes) {
  return function(role_id, role, callback) {
    var group_id = role.working_group;
    delete role.working_group;
    var availability = role.availability;
    delete role.availability;

    VolunteerRoles.update(
      {
        group_id: group_id,
        details: role,
        availability: role.availability
      },
      { where: { role_id: role_id } }
    ).nodeify(function(err) {
      callback(err, role.role_id);
    });
  };
};
