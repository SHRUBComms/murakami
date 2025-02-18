/* jshint indent: 2 */

const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");

module.exports = function (sequelize, DataTypes) {
  const MembershipSubscription = sequelize.define(
    "membership_subscription",
    {
      subscription_id: {
        type: DataTypes.STRING(11),
        allowNull: false,
        primaryKey: true
      },
      member_id: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      subscription_type: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      is_free: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      subscribed_channel: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      subscription_properties: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      start_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      expiry_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
      }
    },
    {
      tableName: "membership_subscription",
      timestamps: false
    }
  );

  Helpers.includeAllModelMethods(
    MembershipSubscription,
    sequelize,
    DataTypes,
    process.env.CWD + "/app/models/membership_subscription/methods/"
  );

  return MembershipSubscription;
};