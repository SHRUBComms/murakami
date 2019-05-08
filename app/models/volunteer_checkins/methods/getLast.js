module.exports = function(VolunteerCheckIns, sequelize, DataTypes) {
  return function(member_id, callback) {
    sequelize
      .max(timestamp, { where: { member_id: member_id } })
      .nodeify(function(err, checkin) {
        if (!err && checkin[0]) {
          callback(null, checkin[0]);
        } else {
          callback(err, null);
        }
      });
  };
};
