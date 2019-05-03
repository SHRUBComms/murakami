/* jshint indent: 2 */

var async = require("async");

module.exports = function(sequelize, DataTypes) {
  var WorkingGroups = sequelize.define(
    "working_groups",
    {
      group_id: {
        type: DataTypes.STRING(12),
        allowNull: false,
        primaryKey: true
      },
      prefix: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      welcomeMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      parent: {
        type: DataTypes.STRING(12),
        allowNull: true
      }
    },
    {
      tableName: "working_groups",
      timestamps: false
    }
  );

  WorkingGroups.getAll = function(callback) {
    WorkingGroups.findAll({}).nodeify(function(err, working_groups_raw) {
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

  return WorkingGroups;
};
