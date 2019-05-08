/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/configs/helpful_functions");

module.exports = function(sequelize, DataTypes) {
  var Tills = sequelize.define(
    "tills",
    {
      till_id: {
        type: DataTypes.STRING(25),
        allowNull: false,
        primaryKey: true
      },
      group_id: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      stockControl: {
        type: DataTypes.INTEGER(4),
        allowNull: false
      }
    },
    {
      tableName: "tills",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    Tills,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/tills/methods/"
  );

  return Tills;
};
