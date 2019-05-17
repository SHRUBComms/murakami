/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/helper-functions/root");

module.exports = function(sequelize, DataTypes) {
  var PasswordReset = sequelize.define(
    "password_reset",
    {
      user_id: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      ip_address: {
        type: DataTypes.STRING(39),
        allowNull: false
      },
      reset_code: {
        type: DataTypes.STRING(25),
        allowNull: false,
        primaryKey: true
      },
      date_issued: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      used: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      }
    },
    {
      tableName: "password_reset",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    PasswordReset,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/password_reset/methods/"
  );

  return PasswordReset;
};
