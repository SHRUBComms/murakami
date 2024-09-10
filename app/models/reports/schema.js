/* jshint indent: 2 */

const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = function (sequelize, DataTypes) {
  const Reports = sequelize.define(
    "reports",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      subject: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      report: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: "reports",
      timestamps: false,
    }
  );
  Helpers.includeAllModelMethods(
    Reports,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/reports/methods/"
  );

  return Reports;
};
