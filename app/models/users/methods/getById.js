module.exports = function(Users, sequelize, DataTypes) {
  return function(id, loggedInUser, callback) {
    var query = `SELECT * FROM users
                LEFT JOIN (SELECT user_id login_user_id, MAX(login_timestamp) lastLogin
                FROM attempts GROUP BY user_id) attempts ON users.id=attempts.login_user_id
                LEFT JOIN data_permissions ON data_permissions.class=users.class
                WHERE users.id = id`;

    sequelize
      .query(query, {
        replacements: {
          id: id,
          type: DataTypes.QueryTypes.SELECT
        }
      })
      .nodeify(function(err, user) {
        try {
          if (user[0][0]) {
            console.log(user[0][0]);
            Users.sanitizeUser([user[0][0]], loggedInUser, function(
              sanitizedUser
            ) {
              callback(err, sanitizedUser[0]);
            });
          } else {
            callback(err, null);
          }
        } catch (err) {
          callback("Error", null);
        }
      });
  };
};
