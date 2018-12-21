var con = require("./index");
var mysql = require("mysql");

var Helpers = require("../configs/helpful_functions");
var Members = require("./members");

var Transactions = {};

Transactions.getAll = function(callback) {
  var query = "SELECT * FROM transactions";
  con.query(query, callback);
};

Transactions.getAllFromLast30Days = function(callback) {
  var query =
    "SELECT * FROM transactions WHERE transaction_date BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW() GROUP BY member_id";
  con.query(query, callback);
};

Transactions.getByMemberId = function(member_id, callback) {
  var query =
    "SELECT * FROM transactions WHERE member_id = ? ORDER BY transaction_date DESC";
  var inserts = [member_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Transactions.add = function(transaction, callback) {
  if (transaction.amount > 0) {
    Members.getById(transaction.member_id, function(err, member) {
      if (err || !member[0]) throw err;

      var query =
        "INSERT INTO transactions (transaction_id, member_id, transaction_type, categories, amount, comment, transaction_date) VALUES (?,?,?,?,?,?,?)";

      // Generate ID!
      Helpers.uniqueIntId(20, "transactions", "transaction_id", function(id) {
        transaction.transaction_id = id;

        var dt = new Date();
        var inserts = [
          transaction.transaction_id,
          transaction.member_id,
          transaction.transaction_type,
          transaction.categories,
          transaction.amount,
          transaction.comment,
          new Date(dt.setMonth(dt.getMonth()))
        ];

        var sql = mysql.format(query, inserts);

        con.query(sql, function(err) {
          callback(err, transaction.transaction_id);
        });
      });
    });
  } else {
    callback();
  }
};

Transactions.getSwapsToday = function(callback) {
  var query =
    "SELECT * FROM transactions WHERE DATE(transaction_date) = CURDATE() AND categories != 'volunteering' AND categories != 'membership'";
  con.query(query, callback);
};

Transactions.undo = function(transaction_id, callback) {
  var query =
    "SELECT * FROM transactions WHERE transaction_id = ? AND transaction_date < NOW() - INTERVAL 1 MINUTE";
  var inserts = [transaction_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, function(err, result) {
    if (result.length == 1) {
      // Delete record
      var query = "DELETE * FROM transactions WHERE transaction_id = ?";
      var inserts = [transaction_id];
      var sql = mysql.format(query, inserts);

      con.query(sql, callback);
    } else {
      return callback(Error("Couldn't undo transaction!"));
    }
  });
};

module.exports = Transactions;
