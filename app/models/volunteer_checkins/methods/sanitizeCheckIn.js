module.exports = function(VolunteerCheckIns, sequelize, DataTypes) {
  return function(checkin, callback) {
    try {
      checkin.questionnaire = JSON.parse(checkin.questionnaire);
    } catch (err) {
      checkin.questionnaire = {};
    }
    callback(checkin);
  };
};
