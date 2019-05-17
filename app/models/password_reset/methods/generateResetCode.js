module.exports = function(PasswordReset, sequelize, DataTypes) {
  var Helpers = require(process.env.CWD + "/app/helper-functions/root");
  var GetId = function(callback) {
    var reset_code = Helpers.generateBase64Id(25);
    PasswordReset.findAll({ where: { reset_code: reset_code } }).nodeify(
      function(err, result) {
        if (result.length > 0) {
          GetId(callback);
        } else if (result.length == 0) {
          callback(reset_code);
        }
      }
    );
  };
  return GetId;
};
