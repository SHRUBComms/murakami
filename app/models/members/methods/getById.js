module.exports = function(Members, sequelize, DataType) {
  return function(id, user, callback) {
    var query = `SELECT * FROM members
                  LEFT JOIN (SELECT member_id volunteer_id, gdpr, roles
                  FROM volunteer_info GROUP BY member_id) volInfo ON volInfo.volunteer_id=members.member_id
                  WHERE members.member_id = ?`;

    sequelize
      .query(query, {
        replacements: [id]
      })
      .nodeify(function(err, member) {
        if (member[0][0]) {
          Members.sanitizeMember(member[0][0], user, callback);
        } else {
          callback(err, null);
        }
      });
  };
};
