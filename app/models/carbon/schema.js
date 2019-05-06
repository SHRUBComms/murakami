/* jshint indent: 2 */

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
        type: DataTypes.TEXT,
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

  Carbon.getByMemberId = require("./methods/getByMemberId")(
    Carbon,
    sequelize,
    DataTypes
  );

  Carbon.getAll = require("./methods/getAll")(Carbon, sequelize, DataTypes);

  Carbon.getAllThisYear = require("./methods/getAllThisYear")(
    Carbon,
    sequelize,
    DataTypes
  );

  Carbon.getToday = require("./methods/getToday")(Carbon, sequelize, DataTypes);

  Carbon.add = require("./methods/add")(Carbon, sequelize, DataTypes);

  Carbon.getAllByWorkingGroup = require("./methods/getAllByWorkingGroup")(
    Carbon,
    sequelize,
    DataTypes
  );
};
