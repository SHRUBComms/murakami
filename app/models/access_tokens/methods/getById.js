module.exports = function(AccessTokens, sequelize, DataTypes) {
  return function(token, callback) {
    AccessTokens.findOne({
      where: {
        token: token,
        used: 0,
        timestamp: {
          [Op.gte]: moment()
            .subtract(24, "hours")
            .toDate()
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
};
