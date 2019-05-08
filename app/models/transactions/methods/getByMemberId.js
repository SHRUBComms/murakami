module.exports = function(Transactions, sequelize, DataTypes) {
  return function(member_id, callback) {
    var query = `SELECT transactions.*, tills.name AS till_name FROM transactions
  INNER JOIN tills ON transactions.till_id=tills.till_id AND transactions.member_id = ?
  ORDER BY date DESC`;
    var inserts = [member_id];
    sequelize
      .query(query, { replacements: inserts })
      .nodeify(function(err, transactions) {
        callback(err, transactions[0]);
      });
  };
};
