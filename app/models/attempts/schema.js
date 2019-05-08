/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/configs/helpful_functions");

var moment = require("moment");
moment.locale("en-gb");

module.exports = function(sequelize, DataTypes) {
  var Attempts = sequelize.define(
    "attempts",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.STRING(11),
        allowNull: false
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: false
      },
      outcome: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "1"
      },
      login_timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      tableName: "attempts",
      timestamps: false
    }
  );

  Attempts.getAllFailedAttemptsThisHour = require("./methods/getAllFailedAttemptsThisHour")(
    Attempts,
    sequelize,
    DataTypes
  );

  return Attempts;
};
