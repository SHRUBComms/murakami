module.exports = function(Tills, sequelize, DataTypes) {
  return function(callback) {
    var query = `SELECT tills.*, working_groups.name AS group_name FROM tills
    JOIN working_groups ON tills.group_id = working_groups.group_id`;
    sequelize.query(query).nodeify(function(err, tills) {
      callback(err, tills[0]);
    });
  };
};
