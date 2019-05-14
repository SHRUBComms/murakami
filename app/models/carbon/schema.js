/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/helper-functions/root");

module.exports = function(sequelize, DataTypes) {
  var Carbon = sequelize.define(
    "carbon",
    {
      transaction_id: {
        type: DataTypes.STRING(30),
        allowNull: false,
        primaryKey: true
      },
      group_id: {
        type: DataTypes.STRING(12),
        allowNull: false
      },
      user_id: {
        type: DataTypes.STRING(25),
        allowNull: false
      },
      member_id: {
        type: DataTypes.STRING(11),
        allowNull: false
      },
      trans_object: {
        type: DataTypes.JSON,
        allowNull: false
      },
      method: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "recycled"
      },
      trans_date: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      tableName: "carbon",
      timestamps: false
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
