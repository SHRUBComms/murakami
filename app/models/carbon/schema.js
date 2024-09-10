/* jshint indent: 2 */

const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = function (sequelize, DataTypes) {
  const Carbon = sequelize.define(
    "carbon",
    {
      transaction_id: {
        type: DataTypes.STRING(30),
        allowNull: false,
        primaryKey: true,
      },
      group_id: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      member_id: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      trans_object: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "recycled",
      },
      trans_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fx_transaction_id: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
    },
    {
      tableName: "carbon",
      timestamps: false,
    }
  );

  Helpers.includeAllModelMethods(
    Carbon,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/carbon/methods/"
  );

  return Carbon;
};
