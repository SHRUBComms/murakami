module.exports = function(VolunteerCheckIns, sequelize, DataTypes) {
  return function(checkin_id, callback) {
    VolunteerCheckIns.findOne({ where: { checkin_id: checkin_id } }).nodeify(
      function(err, checkin) {
        if (!err && checkin) {
          VolunteerCheckIns.sanitizeCheckIn(checkin, function(
            sanitizedCheckin
          ) {
            callback(null, sanitizedCheckin);
          });
        } else {
          callback(err, null);
        }
      }
    );
  };
};
