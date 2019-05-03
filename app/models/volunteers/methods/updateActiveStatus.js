module.exports = function(Volunteers, sequelize, DataTypes) {
  return function(member_id, active, callback) {
    var query = `UPDATE volunteer_info SET active = ? WHERE member_id = ?`;
    var inserts = [active, member_id];
    var sql = mysql.format(query, inserts);
    con.query(sql, callback);
  };
};
