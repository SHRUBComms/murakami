module.exports = function(VolunteerCheckIns, sequelize, DataTypes) {
  return function(member_id, user_id, questionnaire, callback) {
    var query =
      "INSERT INTO volunteer_checkins (checkin_id, member_id, user_id, questionnaire, timestamp) VALUES (?,?,?,?,?)";

    VolunteerCheckIns.generateId(function(checkin_id) {
      VolunteerCheckIns.create({
        checkin_id: checkin_id,
        member_id: member_id,
        user_id: user_id,
        questionnaire: questionnaire,
        timestamp: new Date()
      }).nodeify(callback);
    });
  };
};
