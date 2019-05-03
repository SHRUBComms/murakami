/* jshint indent: 2 */

var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

module.exports = function(sequelize, DataTypes) {
  var VolunteerRoles = sequelize.define(
    "volunteer_roles",
    {
      role_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true
      },
      group_id: {
        type: DataTypes.STRING(12),
        allowNull: true
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      availability: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true
      },
      public: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "0"
      },
      removed: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "0"
      }
    },
    {
      tableName: "volunteer_roles",
      timestamps: false
    }
  );

  VolunteerRoles.getAll = require("./methods/getAll")(
    VolunteerRoles,
    sequelize,
    DataTypes
  );

  return VolunteerRoles;
};
