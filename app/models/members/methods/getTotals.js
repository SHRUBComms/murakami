module.exports = function(Members, sequelize, DataTypes) {
  return function(callback) {
    var query = `SELECT
    (SELECT count(*) FROM members WHERE first_name != '[redacted]') AS members,
    (SELECT count(*) FROM members WHERE is_member = 1) AS current_members,
    (SELECT COUNT(*) FROM members WHERE is_member = 0) AS expired_members`;
    sequelize.query(query).nodeify(function(err, totals) {
      totals = totals[0];
      callback(err, totals);
    });
  };
};
