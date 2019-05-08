module.exports = function(VolunteerHours, sequelize, DataTypes) {
  return function(member_id, callback) {
    VolunteerHours.findAll({
      where: { member_id: member_id, approved: 1 },
      order: [["date", "DESC"]]
    }).nodeify(callback);
  };
};
