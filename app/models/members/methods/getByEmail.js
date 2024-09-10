module.exports = function (Members, sequelize, DataTypes) {
  return async (email) => {
    const query = `SELECT * FROM members
                		LEFT JOIN (SELECT member_id volunteer_id, gdpr, roles
                		FROM volunteer_info GROUP BY member_id) volInfo ON volInfo.volunteer_id=members.member_id
                		WHERE members.email = ?`;
    const inserts = [email];

    try {
      const member = await sequelize.query(query, { replacements: inserts });
      if (member[0] == []) {
        return null;
      } else {
        return member[0][0];
      }
    } catch (error) {
      throw error;
    }
  };
};
