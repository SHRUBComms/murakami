module.exports = (Users, sequelize) => {
  return async (loggedInUser) => {
    const query = `SELECT * FROM users
        LEFT JOIN (SELECT user_id login_user_id, MAX(createdAt) lastLogin
        FROM activity AS attempts WHERE details->"$.outcome" = 1 GROUP BY user_id) attempts ON users.id=attempts.login_user_id`;
    const users = await sequelize.query(query);

    const sanitizedUsers = await Users.sanitizeUser(users[0], loggedInUser);
    return {
      users: sanitizedUsers,
      usersObj: sanitizedUsers.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {}),
    };
  };
};
