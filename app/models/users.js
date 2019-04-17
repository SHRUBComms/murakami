var con = require("./index");
var mysql = require("mysql");
var bcrypt = require("bcrypt-nodejs");
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var Helpers = require("../configs/helpful_functions");
var Attempts = require("./attempts");

var Users = {};

Users.getAll = function(loggedInUser, callback) {
  var query = `SELECT * FROM login
    LEFT JOIN (SELECT user_id login_user_id, MAX(login_timestamp) lastLogin
    FROM attempts GROUP BY user_id) attempts ON login.id=attempts.login_user_id`;
  con.query(query, function(err, users) {
    Users.sanitizeUser(users, loggedInUser, function(
      sanitizedUsers,
      sanitizedUsersObj
    ) {
      callback(err, sanitizedUsers, sanitizedUsersObj);
    });
  });
};

Users.getByUsername = function(username, callback) {
  var query = "SELECT * FROM login WHERE username = ?";
  var inserts = [username];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Users.getCoordinators = function(user, callback) {
  var query = "SELECT * FROM login WHERE (class = 'admin' OR class = 'staff')";

  con.query(query, function(err, coordinators) {
    var kv = {};
    var flat = [];
    coordinators.forEach(function(coordinator) {
      kv[coordinator.id] = coordinator;
      flat.push(coordinator.id);
    });
    callback(err, coordinators, kv, flat);
  });
};

Users.getByUsernameOrEmail = function(email, callback) {
  var query =
    "SELECT * FROM login WHERE (username = ? OR email = ?) AND deactivated = 0";
  var inserts = [email, email];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Users.getByEmail = function(email, callback) {
  var query = "SELECT * FROM login WHERE email = ?";
  var inserts = [email];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Users.getById = function(id, loggedInUser, callback) {
  var query = `SELECT * FROM login
              LEFT JOIN (SELECT user_id login_user_id, MAX(login_timestamp) lastLogin
              FROM attempts GROUP BY user_id) attempts ON login.id=attempts.login_user_id
			  LEFT JOIN data_permissions ON data_permissions.class=login.class

              WHERE login.id = ?`;
  var inserts = [id];
  var sql = mysql.format(query, inserts);

  con.query(sql, function(err, user) {
    Users.sanitizeUser(user, loggedInUser, function(user) {
      callback(err, user);
    });
  });
};

Users.addPasswordReset = function(user_id, ip_address, callback) {
  var query =
    "INSERT INTO password_reset (user_id, ip_address, reset_code, date_issued, used) VALUES (?,?,?,?,?)";
  Helpers.uniqueBase64Id(25, "password_reset", "reset_code", function(id) {
    var dt = new Date();
    var inserts = [
      user_id,
      ip_address,
      id,
      new Date(dt.setMonth(dt.getMonth())),
      0
    ];
    var sql = mysql.format(query, inserts);

    con.query(sql);
    Users.getById(user_id, callback);
  });
};

Users.getUnusedPasswordResetsByUserId = function(user_id, callback) {
  var query =
    "SELECT * FROM password_reset WHERE user_id = ? AND used = 0 AND date_issued > (now() - interval 60 minute)";
  var inserts = [user_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Users.getUnusedPasswordResetsByResetCode = function(reset_code, callback) {
  var query =
    "SELECT * FROM password_reset WHERE reset_code = ? AND used = 0 AND date_issued > (now() - interval 60 minute)";
  var inserts = [reset_code];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Users.updateWorkingGroups = function(user_id, working_groups, callback) {
  var query = "UPDATE login SET working_groups = ? WHERE id = ?";
  var inserts = [working_groups, user_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Users.add = function(user, callback) {
  var query =
    "INSERT INTO login (id, first_name, last_name, username, email, password, class, working_groups, notification_preferences) VALUES (?,?,?,?,?,?,?,?,?)";

  // Generate ID!
  Helpers.uniqueIntId(11, "login", "id", function(id) {
    user.id = id;
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        user.password = hash.replace(/^\$2y(.+)$/i, "$2a$1");
        var inserts = [
          user.id,
          user.first_name,
          user.last_name,
          user.username,
          user.email,
          user.password,
          user.class,
          user.working_groups,
          user.notification_preferences
        ];
        var sql = mysql.format(query, inserts);

        con.query(sql);
        Users.getById(user.id, { class: "admin" }, callback);
      });
    });
  });
};

Users.update = function(user, callback) {
  var query =
    "UPDATE login SET first_name = ?, last_name = ?, class = ?, working_groups = ?, notification_preferences = ? WHERE id = ?";
  var inserts = [
    user.first_name,
    user.last_name,
    user.class,
    user.working_groups,
    user.notification_preferences,
    user.user_id
  ];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Users.updatePassword = function(user_id, password, callback) {
  var query = "UPDATE login SET password = ? WHERE id = ?";
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, null, function(err, hash) {
      password = hash.replace(/^\$2y(.+)$/i, "$2a$1");
      var inserts = [password, user_id];
      var sql = mysql.format(query, inserts);

      con.query(sql, callback);
    });
  });
};

Users.deactivate = function(user_id, callback) {
  var query = "UPDATE login SET deactivated = 1 WHERE id = ?";
  var inserts = [user_id];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Users.setResetCodeAsUsed = function(reset_code, callback) {
  var query = "UPDATE password_reset SET used = 1 WHERE reset_code = ?";
  var inserts = [reset_code];
  var sql = mysql.format(query, inserts);

  con.query(sql, callback);
};

Users.comparePassword = function(candidatePassword, hash, callback) {
  hash = hash.replace(/^\$2y(.+)$/i, "$2a$1");
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
};

Users.sanitizeUser = function(users, loggedInUser, callback) {
  var usersObj = {};
  async.eachOf(
    users,
    function(user, i, callback) {
      if (user.working_groups) {
        user.working_groups = JSON.parse(user.working_groups) || [];
      }

      if (!loggedInUser) {
        delete user.password;
      }
      var hasPermission = false;
      if (loggedInUser.class == "admin" || user.id == loggedInUser.id) {
        hasPermission = true;
      } else {
        if (
          Helpers.hasOneInCommon(
            user.working_groups,
            loggedInUser.working_groups
          ) &&
          ["till", "volunteer"].includes(user.class)
        ) {
          hasPermission = true;
        }
      }

      if (hasPermission) {
        // Full name
        user.full_name = user.first_name + " " + user.last_name;

        if (user.notification_preferences) {
          user.notification_preferences =
            JSON.parse(user.notification_preferences) || {};
        }

        if (user.lastLogin) {
          user.lastLogin = moment(user.lastLogin).format("L");
        } else {
          user.lastLogin = "Never";
        }
        usersObj[user.id] = user;
        callback();
      } else {
        users[i] = {};

        callback();
      }
    },
    function() {
      callback(users, usersObj);
    }
  );
};

module.exports = Users;
