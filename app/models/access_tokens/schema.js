/* jshint indent: 2 */

var AccessTokens = function(sequelize, DataTypes) {
  return sequelize.define(
    "access_tokens",
    {
      token: {
        type: DataTypes.STRING(25),
        allowNull: false,
        primaryKey: true
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      used: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "0"
      }
    },
    {
      tableName: "access_tokens",
      timestamps: false
    }
  );
  AccessTokens.createInvite = require("./methods/createInvite")(
    AccessTokens,
    sequelize,
    DataTypes
  );

  AccessTokens.getById = require("./methods/getById")(
    AccessTokens,
    sequelize,
    DataTypes
  );

  AccessTokens.markAsUsed = require("./methods/markAsUsed")(
    AccessTokens,
    sequelize,
    DataTypes
  );
};

module.exports = AccessTokens;
