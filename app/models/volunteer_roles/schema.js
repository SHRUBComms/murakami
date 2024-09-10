/* jshint indent: 2 */

const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = function (sequelize, DataTypes) {
  const VolunteerRoles = sequelize.define(
    "volunteer_roles",
    {
      role_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
      },
      group_id: {
        type: DataTypes.STRING(12),
        allowNull: true,
      },
      details: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      availability: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      public: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "0",
      },
      removed: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "0",
      },
      dateUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "volunteer_roles",
      timestamps: false,
    }
  );

  Helpers.includeAllModelMethods(
    VolunteerRoles,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/volunteer_roles/methods/"
  );

  return VolunteerRoles;
};
