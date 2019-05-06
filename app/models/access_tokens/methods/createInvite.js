module.exports = function(AccessTokens, sequelize, DataTypes) {
  return function(action, member_id, user, callback) {
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
};
