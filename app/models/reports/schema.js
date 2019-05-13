/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "reports",
    {
      subject: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      report: {
        type: DataTypes.JSON,
        allowNull: false
      }
    },
    {
      tableName: "reports"
    }
  );
};
