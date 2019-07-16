module.exports = function(VolunteerRoles, sequelize, DataTypes) {
  return function(working_group, title, callback) {
    VolunteerRoles.generateId(function(role_id) {
      VolunteerRoles.create({
        role_id: role_id,
        group_id: working_group,
        details: { title: title },
        availability: {},
        dateCreated: new Date(),
        public: 0
      }).nodeify(function(err) {
        callback(err, {
          role_id: role_id,
          group_id: working_group,
          details: { title: title }
        });
      });
    });
  };
};
