/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/configs/helpful_functions");

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
        type: DataTypes.TEXT,
        allowNull: false
      },
      assignedCoordinators: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      survey: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      availability: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      gdpr: {
        type: DataTypes.TEXT,
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
