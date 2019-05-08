module.exports = function(Members, sequelize, DataTypes) {
  return function(member_id, callback) {
    var query =
      "UPDATE members SET first_name = '[redacted]', last_name = '[redacted]', email = '[redacted]', phone_no = '[redacted]', address = '[redacted]', working_groups = '[]', is_member = 0 WHERE member_id = ?; DELETE FROM volunteer_info WHERE member_id = ?";
    var inserts = [member_id, member_id];
    sequelize.query(query, { replacements: inserts }).nodeify(callback);
  };
};
