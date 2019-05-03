/* jshint indent: 2 */

var AccessTokens = function(sequelize, DataTypes) {
  return sequelize.define(
    "access_tokens",
    {
      token: {
        type: DataTypes.STRING(25),
        allowNull: false,
        primaryKey: true
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      used: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        defaultValue: "0"
      }
    },
    {
      tableName: "access_tokens"
    }
  );
};

AccessTokens.createInvite = function(action, member_id, user, callback) {
  var query =
    "INSERT INTO access_tokens (token, action, user_id, timestamp, used) VALUES (?,?,?,?,?)";
  Helpers.uniqueBase64Id(25, "access_tokens", "token", function(token) {
    var inserts = [token, action, user.id, new Date(), 0];
    var sql = mysql.format(query, inserts);
    con.query(sql, function(err) {
      var link;
      if (action == "make-volunteer") {
        link =
          process.env.PUBLIC_ADDRESS + "/members/make-volunteer/" + member_id;
      } else if (action == "add-volunteer") {
        link = process.env.PUBLIC_ADDRESS + "/volunteers/add";
      }

      link += "?token=" + token;

      callback(err, link);
    });
  });
};

AccessTokens.getById = function(token, callback) {
  AccessTokens.findOne({
    where: {
      token: token,
      used: 0,
      timestamp: {
        [Op.gte]: moment()
          .subtract(24, "hours")
          .format("YYYY-MM-DD HH:mm:ss")
      }
    }
  }).then(function(invite) {
    try {
      invite = invite[0];
      invite.details = JSON.parse(invite.details);
    } catch (err) {
      invite = {};
    }
    callback(err, invite);
  });
};

AccessTokens.createToken = function(details, callback) {
  Helpers.uniqueBase64Id(25, "access_tokens", "token", function(token) {
    AccessTokens.create({
      token: token,
      timestamp: new Date(),
      details: JSON.stringify(details),
      used: 0
    })
      .then(function() {
        callback(null, token);
      })
      .catch(function(err) {
        callback(err, null);
      });
  });
};

AccessTokens.markAsUsed = function(token, callback) {
  AccessTokens.update({ used: 1 }, { where: { token: token } })

    .then(function() {
      callback(null);
    })

    .catch(function(err) {
      callback(err);
    });
};

module.exports = AccessTokens;
