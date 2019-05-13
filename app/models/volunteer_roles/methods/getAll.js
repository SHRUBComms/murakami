var async = require("async");

module.exports = function(VolunteerRoles, sequelize, DataTypes) {
  return function(callback) {
    VolunteerRoles.findAll({ order: [["dateCreated", "DESC"]] }).nodeify(
      function(err, roles) {
        var rolesGroupedByGroup = {};
        var rolesGroupedById = {};

        async.each(
          roles,
          function(role, callback) {
            if (Object.keys(role.details).length == 1) {
              role.incomplete = true;
            } else {
              role.incomplete = false;
            }

            if (!rolesGroupedByGroup[role.group_id]) {
              rolesGroupedByGroup[role.group_id] = [role];
            } else {
              rolesGroupedByGroup[role.group_id].push(role);
            }

            rolesGroupedById[role.role_id] = role;

            callback();
          },
          function() {
            callback(err, roles, rolesGroupedByGroup, rolesGroupedById);
          }
        );
      }
    );
  };
};
