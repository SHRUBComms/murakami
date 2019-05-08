module.exports = function(Members, sequelize, DataTypes) {
  return function(search, callback) {
    var query = `SELECT * FROM members
      LEFT JOIN (SELECT member_id volunteer_id, gdpr, roles
      FROM volunteer_info GROUP BY member_id) volInfo ON volInfo.volunteer_id=members.member_id
      WHERE (CONCAT(first_name, ' ', last_name) LIKE ? OR barcode = ? OR member_id = ?) AND first_name != '[redacted]'
      ORDER BY first_name ASC LIMIT 3`;
    var inserts = ["%" + search + "%", search, search];

    sequelize
      .query(query, { replacements: inserts })
      .nodeify(function(err, members) {
        callback(err, members[0]);
      });
  };
};
