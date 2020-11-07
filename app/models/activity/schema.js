/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

var moment = require("moment");
moment.locale("en-gb");

module.exports = function(sequelize, DataTypes) {
  var Activity = sequelize.define(
    "activity",
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
      action: { type: DataTypes.TEXT, allowNull: false },
      details: { type: DataTypes.JSON, allowNull: false }
    },
    {
      tableName: "activity",
      timestamps: true
    }
  );

  return Activity;
};
