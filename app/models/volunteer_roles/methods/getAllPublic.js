module.exports = function(VolunteerRoles, sequelize, DataTypes) {
  return function(callback) {
    var query =
      "SELECT * FROM volunteer_roles WHERE public = 1 AND removed = 0";
    VolunteerRoles.findAll({ where: { public: 1, removed: 0 } }).nodeify(
      function(err, roles) {
        async.each(
          roles,
          function(role, callback) {
            role.details = JSON.parse(role.details);
            callback();
          },
          function() {
            callback(err, roles);
          }
        );
      }
    );
  };
};
