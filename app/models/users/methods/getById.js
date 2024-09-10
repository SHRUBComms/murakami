module.exports = (Users, sequelize, DataTypes) => {
  return async (id, loggedInUser) => {
    try {
      const query = `SELECT * FROM users
				LEFT JOIN (SELECT user_id login_user_id, MAX(createdAt) lastLogin
				FROM activity AS attempts WHERE details->"$.outcome" = 1 GROUP BY user_id) attempts ON users.id=attempts.login_user_id
				LEFT JOIN data_permissions ON data_permissions.class=users.class
				WHERE users.id = ?`;

      const user = await sequelize.query(query, {
        replacements: [id],
        type: DataTypes.QueryTypes.SELECT,
      });

      if (!user[0]) {
        throw "User not found";
      }

      const sanitizedUsers = await Users.sanitizeUser(user, loggedInUser);
      return sanitizedUsers[0];
    } catch (error) {
      throw error;
    }
  };
};
