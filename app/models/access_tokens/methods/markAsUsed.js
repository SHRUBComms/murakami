module.exports = function(AccessTokens, sequelize, DataTypes) {
  return function(token, callback) {
    AccessTokens.update({ used: 1 }, { where: { token: token } })
    .nodeify(function(err) {
      callback(err);
    });
  };
};
