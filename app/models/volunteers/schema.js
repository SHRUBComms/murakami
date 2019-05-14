/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/helper-functions/root");

module.exports = function(sequelize, DataTypes) {
  var Volunteers = sequelize.define(
    "volunteer_info",
    {
      member_id: {
        type: DataTypes.STRING(11),
        allowNull: false,
        primaryKey: true
      },
      emergencyContactRelation: {
        type: DataTypes.STRING(25),
        allowNull: false
      },
      emergencyContactName: {
        type: DataTypes.STRING(25),
        allowNull: false
      },
      emergencyContactPhoneNo: {
        type: DataTypes.STRING(15),
        allowNull: false
      },
      roles: {
        type: DataTypes.JSON,
        allowNull: false
      },
      assignedCoordinators: {
        type: DataTypes.JSON,
        allowNull: false
      },
      survey: {
        type: DataTypes.JSON,
        allowNull: false
      },
      availability: {
        type: DataTypes.JSON,
        allowNull: false
      },
      gdpr: {
        type: DataTypes.JSON,
        allowNull: false
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      lastUpdated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      tableName: "volunteer_info",
      timestamps: false
    }
  );

  Volunteers.getVolInfoById = function(id, callback) {
    callback("err", null);
  };

  Helpers.includeAllModelMethods(
    Volunteers,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/volunteers/methods/"
  );

  return Volunteers;
};
