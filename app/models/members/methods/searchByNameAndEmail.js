module.exports = function(Members, sequelize, DataTypes) {
  return function(info, callback) {
    var query =
      "SELECT * FROM members WHERE (CONCAT(first_name, ' ', last_name) LIKE ?) AND email = ?";
    var inserts = ["%" + info.name + "%", info.email];

    sequelize.query(query, { replacements: inserts });
    nodeify(function(err, members) {
      callback(err, members[0]);
    });
  };
};
