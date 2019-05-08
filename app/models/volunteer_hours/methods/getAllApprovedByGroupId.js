module.exports = function(VolunteerHours, sequelize, DataTypes) {
  return function(group_id, callback) {
    VolunteerHours.findAll({
      where: { working_group: group_id, approved: 1 },
      order: [["date", "DESC"]]
    }).nodeify(callback);
  };
};
