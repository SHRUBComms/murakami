module.exports = function(Attempts, sequelize, DataTypes) {
  return function(user_id, callback) {
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
};
