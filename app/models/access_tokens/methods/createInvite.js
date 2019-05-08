module.exports = function(AccessTokens, sequelize, DataTypes) {
  return function(details, callback) {
    var query =
      "INSERT INTO access_tokens (token, action, user_id, timestamp, used) VALUES (?,?,?,?,?)";
    AccessTokens.generateId(function(token) {
      AccessTokens.create({
        token: token,
        timestamp: new Date(),
        details: JSON.stringify(details),
        used: 0
      }).nodeify(function(err) {
        callback(err, token);
      });
    });
  };
};
