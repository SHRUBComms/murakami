module.exports = function(AccessTokens, sequelize, DataTypes) {
  return function(expirationTimestamp, details, callback) {
    AccessTokens.generateId(function(token) {
      AccessTokens.create({
        token: token,
        expirationTimestamp: expirationTimestamp,
        details: details,
        used: 0
      }).nodeify(function(err) {
        callback(err, token);
      });
    });
  };
};
