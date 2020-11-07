/* jshint indent: 2 */

var Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = function(sequelize, DataTypes) {
  var Members = sequelize.define(
    "members",
    {
      member_id: {
        type: DataTypes.STRING(11),
        allowNull: false,
        primaryKey: true
      },
      barcode: {
        type: DataTypes.STRING(15),
        allowNull: true,
        unique: true
      },
      first_name: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING(30),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(89),
        allowNull: false
      },
      phone_no: {
        type: DataTypes.STRING(15),
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_member: {
        type: DataTypes.INTEGER(1),
        allowNull: false
      },
      free: {
        type: DataTypes.INTEGER(1),
        allowNull: false
      },
      working_groups: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      contactPreferences: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      },
      balance: {
        type: DataTypes.INTEGER(10),
        allowNull: false
      },
      membership_type: {
        type: DataTypes.STRING(15),
        allowNull: true
      },
      earliest_membership_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      current_init_membership: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      current_exp_membership: {
        type: DataTypes.DATEONLY,
        allowNull: false
      }
    },
    {
      tableName: "members",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    Members,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/members/methods/"
  );

  return Members;
};
