/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/configs/helpful_functions");

module.exports = function(sequelize, DataTypes) {
  var Users = sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.STRING(11),
        allowNull: false,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      class: {
        type: DataTypes.STRING(25),
        allowNull: false
      },
      working_groups: {
        type: DataTypes.JSON,
        allowNull: true
      },
      notification_preferences: {
        type: DataTypes.JSON,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      deactivated: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "0"
      }
    },
    {
      tableName: "users",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    Users,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/users/methods/"
  );

  return Users;
};
