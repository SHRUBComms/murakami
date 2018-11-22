var mysql = require("mysql");
var async = require("async");
var con = require("./index");

var Helpers = require("../configs/helpful_functions");

var Tills = {};

Tills.getAllTills = function(callback) {
  var query = `SELECT tills.*, working_groups.name AS group_name FROM tills
  JOIN working_groups ON tills.group_id = working_groups.group_id`;
  con.query(query, callback);
};

Tills.updateTill = function(till, callback) {
  var query = "UPDATE tills SET name = ?, stockControl = ? WHERE till_id = ?";
  var inserts = [till.name, 0, till.till_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Tills.searchCategories = function(term, till_id, callback) {
  var query =
    "SELECT * FROM stock_categories WHERE till_id = ? AND name LIKE ? AND active = 1 ORDER BY name ASC LIMIT 5";
  var inserts = [till_id, "%" + term + "%"];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Tills.getTillById = function(till_id, callback) {
  var query = `SELECT tills.*, working_groups.name AS group_name FROM tills
        JOIN working_groups ON tills.group_id = working_groups.group_id AND tills.till_id = ?`;
  var inserts = [till_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, function(err, till) {
    till = till[0];
    callback(err, till);
  });
};

Tills.removeCategory = function(item_id, callback) {
  var query =
    "UPDATE stock_categories SET active = 0 WHERE item_id = ? OR parent = ?";
  var inserts = [item_id, item_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Tills.addCategory = function(category, callback) {
  var query =
    "INSERT INTO stock_categories (item_id, till_id, carbon_id, name, value, allowTokens, parent) VALUES (?,?,?,?,?,?,?)";
  Helpers.uniqueBase64Id(10, "stock_categories", "item_id", function(id) {
    var inserts = [
      id,
      category.till_id,
      category.carbon_id,
      category.name,
      category.value,
      category.allowTokens,
      category.parent
    ];
    var sql = mysql.format(query, inserts);
    con.query(sql, function(err, newCategory) {
      callback(err, newCategory, id);
    });
  });
};

Tills.updateCategory = function(category, callback) {
  var query =
    "UPDATE stock_categories SET carbon_id = ?, name = ?, value = ?, allowTokens = ? WHERE item_id = ?";

  var inserts = [
    category.carbon_id,
    category.name,
    category.value,
    category.allowTokens,
    category.item_id
  ];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Tills.moveCategory = function(item_id, newParent, callback) {
  var query = "UPDATE stock_categories SET parent = ? WHERE item_id = ?";

  var inserts = [newParent, item_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Tills.getTillsByGroupId = function(group_id, callback) {
  var query = "SELECT * FROM tills WHERE group_id = ?";
  var inserts = [group_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Tills.addTransaction = function(transaction, callback) {
  var query =
    "INSERT INTO transactions (transaction_id, till_id, user_id, member_id, date, summary) VALUES (?,?,?,?,?,?)";

  // Generate ID.
  Helpers.uniqueIntId(10, "transactions", "transaction_id", function(id) {
    transaction.transaction_id = id;
    var inserts = [
      transaction.transaction_id,
      transaction.till_id,
      transaction.user_id,
      transaction.member_id,
      transaction.date,
      transaction.summary
    ];
    var sql = mysql.format(query, inserts);

    con.query(sql, callback);
  });
};

Tills.getFlatCategoriesByTillId = function(till_id, callback) {
  var query =
    "SELECT * FROM stock_categories WHERE till_id = ? OR till_id IS NULL";
  var inserts = [till_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Tills.getCategoryById = function(item_id, callback) {
  var query = "SELECT * FROM stock_categories WHERE item_id = ?";
  var inserts = [item_id];
  var sql = mysql.format(query, inserts);
  con.query(sql, callback);
};

Tills.getCategoriesByTillId = function(till_id, format, callback) {
  var query =
    "SELECT * FROM stock_categories WHERE (till_id = ? OR till_id IS NULL) AND active = 1";
  var inserts = [till_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, function(err, categories) {
    if (err) {
      callback(null);
    } else {
      if (format == "tree") {
        Helpers.treeify(categories, function(tree) {
          callback(err, tree);
        });
      } else if (format == "kv") {
        var categoriesObj = {};
        async.each(
          categories,
          function(category, callback) {
            categoriesObj[category.item_id] = category;
            callback();
          },
          function() {
            callback(err, categoriesObj);
          }
        );
      } else {
        callback(err, categories);
      }
    }
  });
};

Tills.getCategories = function(format, callback) {
  var query =
    "SELECT * FROM stock_categories";

  con.query(query, function(err, categories) {
    if (err) {
      callback(null);
    } else {
      if (format == "tree") {
        Helpers.treeify(categories, function(tree) {
          callback(err, tree);
        });
      } else if (format == "kv") {
        var categoriesObj = {};
        async.each(
          categories,
          function(category, callback) {
            categoriesObj[category.item_id] = category;
            callback();
          },
          function() {
            callback(err, categoriesObj);
          }
        );
      } else {
        callback(err, categories);
      }
    }
  });
};

Tills.getAllCategories = function(callback) {
  var query = "SELECT * FROM stock_categories";
  con.query(query, function(err, categories) {
    var categoriesObj = {};
    async.each(
      categories,
      function(category, callback) {
        categoriesObj[category.item_id] = category;
        callback();
      },
      function() {
        callback(err, categoriesObj);
      }
    );
  });
};

Tills.getStatusById = function(till_id, callback) {
  var query =
    "SELECT * FROM till_activity WHERE till_id = ? ORDER BY timestamp DESC";
  var inserts = [till_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, function(err, actions) {
    if (actions.length > 0) {
      callback(actions[0]);
    } else {
      callback({ opening: 0 });
    }
  });
};

Tills.open = function(till_id, counted_float, user_id, callback) {
  var query =
    "INSERT INTO till_activity (action_id, till_id, user_id, expected_float, counted_float, opening) VALUES (?,?,?,?,?,?)";
  Helpers.uniqueIntId(20, "transactions", "transaction_id", function(id) {
    var inserts = [id, till_id, user_id, null, counted_float, 1];

    var sql = mysql.format(query, inserts);

    con.query(sql, callback);
  });
};

Tills.close = function(
  till_id,
  expected_float,
  counted_float,
  user_id,
  callback
) {
  var query =
    "INSERT INTO till_activity (action_id, till_id, user_id, expected_float, counted_float, opening) VALUES (?,?,?,?,?,?)";
  Helpers.uniqueIntId(20, "transactions", "transaction_id", function(id) {
    var inserts = [id, till_id, user_id, expected_float, counted_float, 0];

    var sql = mysql.format(query, inserts);

    con.query(sql, callback);
  });
};

Tills.getTotalCashTakingsSince = function(till_id, timestamp, callback) {
  var query =
    "SELECT * FROM transactions WHERE till_id = ? AND (date >= ? AND date <= NOW())";
  var inserts = [till_id, timestamp];
  var sql = mysql.format(query, inserts);

  con.query(sql, function(err, transactions) {
    if (transactions.length > 0) {
      var money_total = 0;
      async.each(
        transactions,
        function(transaction, callback) {
          transaction.summary = JSON.parse(transaction.summary);

          if (transaction.summary.paymentMethod == "cash") {
            money_total = +money_total + +transaction.summary.totals.money;
          }

          callback();
        },
        function() {
          callback(money_total);
        }
      );
    } else {
      callback(0);
    }
  });
};

Tills.getTransactionsSinceOpening = function(till_id, timestamp, callback) {
  var query =
    "SELECT * FROM transactions WHERE till_id = ? AND (date >= ? AND date <= NOW()) ORDER BY date DESC";
  var inserts = [till_id, timestamp];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Tills.getTransactionsByMemberId = function(member_id, callback) {
  var query = `SELECT transactions.*, tills.name AS till_name FROM transactions 
  INNER JOIN tills ON transactions.till_id=tills.till_id AND transactions.member_id = "383039112" 
  ORDER BY date DESC`;
  var inserts = [member_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
}

module.exports = Tills;
