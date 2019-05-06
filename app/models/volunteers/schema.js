/* jshint indent: 2 */

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

  Volunteers.putVolInfo = require("./methods/putVolInfo")(
    Volunteers,
    sequelize,
    DataTypes
  );

  Volunteers.getAllVolunteerInfo = require("./methods/getAllVolunteerInfo")(
    Volunteers,
    sequelize,
    DataTypes
  );

  Volunteers.getByGroupId = require("./methods/getByGroupId")(
    Volunteers,
    sequelize,
    DataTypes
  );

  Volunteers.sanitizeVolunteer = require("./methods/sanitizeVolunteer")(
    Volunteers,
    sequelize,
    DataTypes
  );

  Volunteers.updateRoles = require("./methods/updateRoles")(
    Volunteers,
    sequelize,
    DataTypes
  );

  Volunteers.getVolunteerById = require("./methods/getVolunteerById")(
    Volunteers,
    sequelize,
    DataTypes
  );

  Volunteers.updateActiveStatus = require("./methods/updateActiveStatus")(
    Volunteers,
    sequelize,
    DataTypes
  );

  Volunteers.addExistingMember = require("./methods/updateActiveStatus")(
    Volunteers,
    sequelize,
    DataTypes
  );

  Volunteers.updateVolunteer = require("./methods/updateVolunteer")(
    Volunteers,
    sequelize,
    DataTypes
  );

  return Volunteers;
};
