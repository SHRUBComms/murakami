module.exports = function (Members, sequelize, DataTypes) {
  return function (search, group_id, callback) {
    const query =
      "SELECT * FROM members " +
      "WHERE (CONCAT(first_name, ' ', last_name) LIKE ?) AND first_name != '[redacted]' " +
      "AND working_groups LIKE ?" +
      "ORDER BY first_name ASC LIMIT 3";
    const inserts = ["%" + search + "%", "%" + group_id + "%"];

    sequelize.query(query, { replacements: inserts });
    nodeify(callback);
  };
};
