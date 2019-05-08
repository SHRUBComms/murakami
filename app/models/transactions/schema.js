/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/configs/helpful_functions");

module.exports = function(sequelize, DataTypes) {
  var Transactions = sequelize.define(
    "transactions",
    {
      transaction_id: {
        type: DataTypes.STRING(30),
        allowNull: false,
        primaryKey: true
      },
      till_id: {
        type: DataTypes.STRING(25),
        allowNull: true
      },
      user_id: {
        type: DataTypes.STRING(25),
        allowNull: false
      },
      member_id: {
        type: DataTypes.STRING(15),
        allowNull: true
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      tableName: "transactions",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    Transactions,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/transactions/methods/"
  );

  return Transactions;
};
