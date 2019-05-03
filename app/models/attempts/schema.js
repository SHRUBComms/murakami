/* jshint indent: 2 */

var moment = require("moment");
moment.locale("en-gb");

module.exports = function(sequelize, DataTypes) {
  var Attempts = sequelize.define(
    "attempts",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.STRING(11),
        allowNull: false
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: false
      },
      outcome: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "1"
      },
      login_timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      tableName: "attempts",
      timestamps: false
    }
  );

  Attempts.failed = function(user_id, ip_address) {
    Attempts.create({
      user_id: user_id,
      ip_address: ip_address,
      outcome: 0,
      login_timestamp: new Date()
    });
  };

  Attempts.passed = function(user_id, ip_address) {
    Attempts.create({
      user_id: user_id,
      ip_address: ip_address,
      outcome: 1,
      login_timestamp: new Date()
    });
  };

  Attempts.getLastLogin = function(user_id, callback) {
    Attempts.findOne({
      attributes: ["login_timestamp", "login_timestamp"],
      where: {
        user_id: user_id,
        outcome: 1
      },
      order: [["login_timestamp", "DESC"]],
      limit: 1
    }).nodeify(function(err, lastLogin) {
      callback(err, lastLogin);
    });
  };

  Attempts.getAllFailedAttemptsThisHour = function(user_id, callback) {
    Attempts.findAll({
      where: {
        user_id: user_id,
        outcome: 0,
        login_timestamp: {
          [DataTypes.Op.gte]: moment()
            .subtract(60, "minutes")
            .toDate()
        }
      }
    }).nodeify(function(err, attempts) {
      callback(err, attempts);
    });
  };
  return Attempts;
};
