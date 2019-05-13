module.exports = function(VolunteerRoles, sequelize, DataTypes) {
  return function(role, callback) {
    var query =
      "INSERT INTO volunteer_roles (role_id,group_id,details,availability,dateCreated,public) VALUES (?,?,?,?,?,0)";
    VolunteerRoles.generateId(function(role_id) {
      var group_id = role.working_group;
      delete role.working_group;

      var availability = role.availability;
      delete role.availability;

      VolunteerRoles.create({
        role_id: role_id,
        group_id: group_id,
        details: role,
        availability: availability,
        dateCreated: new Date(),
        public: 0
      }).nodeify(function(err) {
        callback(err, role_id);
      });
    });
  };
};
