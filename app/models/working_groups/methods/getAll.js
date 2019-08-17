var async = require("async");

module.exports = function(WorkingGroups, sequelize, DataTypes) {
  return function(callback) {
    WorkingGroups.findAll({ raw: true }).nodeify(function(
      err,
      working_groups_raw
    ) {
      var working_groups = {};
      var working_groups_arr = [];

      async.each(
        working_groups_raw,
        function(group, callback) {
          working_groups_arr.push(group.group_id);
          working_groups[group.group_id] = group;

          if (group.parent) {
            try {
              working_groups[group.parent].children.push(group.group_id);
            } catch (err) {
              working_groups[group.parent].children = [group.group_id];
            }
          }

          callback();
        },
        function() {
          callback(err, working_groups, working_groups_raw, working_groups_arr);
        }
      );
    });
  };
};
