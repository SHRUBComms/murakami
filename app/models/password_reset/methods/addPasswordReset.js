module.exports = function(PasswordReset, sequelize, DataTypes) {
  return function(user_id, ip_address, callback) {
    PasswordReset.generateResetCode(function(reset_code) {
      PasswordReset.create({
        user_id: user_id,
        ip_address: ip_address,
        reset_code: reset_code,
        date_issued: new Date(),
        used: 0
      }).nodeify(function(err) {
        callback(err, reset_code);
      });
    });
  };
};
