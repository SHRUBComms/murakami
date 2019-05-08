/* jshint indent: 2 */

var PasswordReset = function(sequelize, DataTypes) {
  return sequelize.define(
    "password_reset",
    {
      user_id: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      ip_address: {
        type: DataTypes.STRING(39),
        allowNull: false
      },
      reset_code: {
        type: DataTypes.STRING(25),
        allowNull: false,
        primaryKey: true
      },
      date_issued: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      used: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0"
      }
    },
    {
      tableName: "password_reset"
    }
  );
};

PasswordReset.addPasswordReset = function(user_id, ip_address, callback) {
  var query =
    "INSERT INTO password_reset (user_id, ip_address, reset_code, date_issued, used) VALUES (?,?,?,?,?)";
  Helpers.uniqueBase64Id(25, "password_reset", "reset_code", function(id) {
    PasswordReset.create({
      user_id: user_id,
      ip_address: ip_address,
      reset_code: id,
      date_issued: new Date(),
      used: 0
    })
      .then(function() {
        callback(null);
      })
      .catch(function(err) {
        callback(err);
      });
  });
};

PasswordReset.getUnusedPasswordResetsByUserId = function(user_id, callback) {
  PasswordReset.findAll({
    where: {
      user_id: user_id,
      used: 0,
      date_issued: {
        [Op.gte]: moment()
          .subtract(60, "minutes")
          .toDate()
      }
    }
  })
    .then(function(resets) {
      callback(null, resets);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

PasswordReset.getUnusedPasswordResetsByResetCode = function(
  reset_code,
  callback
) {
  PasswordReset.findOne({
    where: {
      reset_code: reset_code,
      used: 0,
      date_issued: {
        [Op.gte]: moment()
          .subtract(60, "minutes")
          .toDate()
      }
    }
  })
    .then(function(resets) {
      callback(null, resets);
    })
    .catch(function(err) {
      callback(err, null);
    });
};

PasswordReset.setResetCodeAsUsed = function(reset_code, callback) {
  var query = "UPDATE password_reset SET used = 1 WHERE reset_code = ?";

  PasswordReset.update({ used: 1 }, { where: { reset_code: reset_code } })
    .then(function() {
      callback(null);
    })
    .catch(function(err) {
      callback(err);
    });
};

module.exports = PasswordReset;
