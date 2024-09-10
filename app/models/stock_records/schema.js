/* jshint indent: 2 */

const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = function (sequelize, DataTypes) {
  const StockRecords = sequelize.define(
    "stock_records",
    {
      action_id: {
        type: DataTypes.STRING(25),
        allowNull: false,
        primaryKey: true,
      },
      item_id: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      till_id: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      itemCondition: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      user_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      actionInfo: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: "stock_records",
      timestamps: false,
    }
  );

  Helpers.includeAllModelMethods(
    StockRecords,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/stock_records/methods/"
  );

  return StockRecords;
};
