module.exports = function (Members, sequelize, DataTypes) {
  return function (member_id, callback) {
    const query =
      "DELETE FROM members WHERE member_id = ?;" +
      "DELETE FROM transactions WHERE member_id = ?;" +
      "DELETE FROM volunteer_hours WHERE member_id = ?;" +
      "DELETE FROM volunteer_info WHERE member_id = ?;" +
      "DELETE FROM carbon WHERE member_id = ?;";

    const inserts = [member_id, member_id, member_id, member_id, member_id, member_id];

    sequelize.query(query, { replacements: inserts }).nodeify(function (err) {
      callback(err);
    });
  };
};
