module.exports = function(Users, sequelize, DataTypes) {
  return function(id, loggedInUser, callback) {
    var query = `SELECT * FROM users
                LEFT JOIN (SELECT user_id login_user_id, MAX(createdAt) lastLogin
                FROM activity AS attempts WHERE details->"$.outcome" = 1 GROUP BY user_id) attempts ON users.id=attempts.login_user_id
                LEFT JOIN data_permissions ON data_permissions.class=users.class
                WHERE users.id = ?`;

    sequelize
      .query(query, {
        replacements: [id],
        type: DataTypes.QueryTypes.SELECT
      })
      .nodeify(function(err, user) {
        if (!err) {
          try {
            if (user[0]) {
              Users.sanitizeUser(user, loggedInUser, function(sanitizedUser) {
                callback(err, sanitizedUser[0]);
              });
            } else {
              callback(err, null);
            }
          } catch (error) {
            callback(error, null);
          }
        } else {
          callback(err, null);
        }
      });
  };
};
