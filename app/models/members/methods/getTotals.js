module.exports = (Members, sequelize, DataTypes) => {
  return async () => {
    const query = `SELECT
    				(SELECT count(*) FROM members WHERE first_name != '[redacted]') AS members,
    				(SELECT count(*) FROM members WHERE is_member = 1) AS current_members,
    				(SELECT COUNT(*) FROM members WHERE is_member = 0) AS expired_members`;
    const totals = await sequelize.query(query);
    return totals[0];
  };
};
