/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/helper-functions/root");

module.exports = function(sequelize, DataTypes) {
  var VolunteerCheckIns = sequelize.define(
    "volunteer_checkins",
    {
      checkin_id: {
        type: DataTypes.STRING(25),
        allowNull: false,
        primaryKey: true
      },
      member_id: {
        type: DataTypes.STRING(11),
        allowNull: false
      },
      user_id: {
        type: DataTypes.STRING(11),
        allowNull: false
      },
      questionnaire: {
        type: DataTypes.JSON,
        allowNull: false
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      tableName: "volunteer_checkins",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    VolunteerCheckIns,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/volunteer_checkins/methods/"
  );

  return VolunteerCheckIns;
};
