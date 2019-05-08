module.exports = function(Users, sequelize, DataTypes) {
  return function(loggedInUser, callback) {
    var query = `SELECT * FROM users
    LEFT JOIN (SELECT user_id login_user_id, MAX(login_timestamp) lastLogin
    FROM attempts GROUP BY user_id) attempts ON users.id=attempts.login_user_id`;
    sequelize.query(query).nodeify(function(err, users) {
      users = users[0];
      Users.sanitizeUser(users, loggedInUser, function(
        sanitizedUsers,
        sanitizedUsersObj
      ) {
        callback(err, sanitizedUsers, sanitizedUsersObj);
      });
    });
  };
};
