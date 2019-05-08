module.exports = function(Members, sequelize, DataTypes) {
  return function(email, callback) {
    var query = `SELECT * FROM members
                LEFT JOIN (SELECT member_id volunteer_id, gdpr, roles
                FROM volunteer_info GROUP BY member_id) volInfo ON volInfo.volunteer_id=members.member_id
                WHERE members.email = ?`;
    var inserts = [email];

    sequelize
      .query(query, { replacements: inserts })
      .nodeify(function(err, member) {
        callback(err, member[0]);
      });
  };
};
