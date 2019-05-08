module.exports = function(Members, sequelize, DataTypes) {
  return function(member_id, free, callback) {
    var query = "UPDATE members SET free = ? WHERE member_id = ?";
    Members.update({ free: free }, { where: { member_id: member_id } }).nodeify(
      function(err) {
        callback(err);
      }
    );
  };
};
