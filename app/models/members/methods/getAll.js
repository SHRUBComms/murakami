var async = require("async");

module.exports = function(Members, sequelize, DataType) {
  return function(callback) {
    var query = `SELECT * FROM members
                  LEFT JOIN (SELECT member_id volunteer_id, gdpr, roles
                  FROM volunteer_info GROUP BY member_id) volInfo ON volInfo.volunteer_id=members.member_id
                  ORDER BY first_name ASC LIMIT 1000000`;
    sequelize.query(query).nodeify(function(err, members) {
      var membersObj = {};
      members = members[0];
      async.each(
        members,
        function(member, callback) {
          membersObj[member.member_id] = member;
          callback();
        },
        function() {
          callback(err, members, membersObj);
        }
      );
    });
  };
};
