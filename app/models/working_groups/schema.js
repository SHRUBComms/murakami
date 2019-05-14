/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/helper-functions/root");

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

  Helpers.includeAllModelMethods(
    WorkingGroups,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/working_groups/methods/"
  );

  return WorkingGroups;
};
