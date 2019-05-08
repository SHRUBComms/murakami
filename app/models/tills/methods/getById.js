module.exports = function(Tills, sequelize, DataTypes) {
  return function(till_id, callback) {
    var query = `SELECT tills.*, working_groups.name AS group_name FROM tills
        JOIN working_groups ON tills.group_id = working_groups.group_id AND tills.till_id = ?`;
    var inserts = [till_id];

    sequelize
      .query(query, { replacements: inserts })
      .nodeify(function(err, till) {
        try {
          callback(err, till[0][0]);
        } catch (err) {
          callback(err, null);
        }
      });
  };
};
