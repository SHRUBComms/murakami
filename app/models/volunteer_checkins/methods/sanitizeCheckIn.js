module.exports = function(VolunteerCheckIns, sequelize, DataTypes) {
  return function(checkin, callback) {
    if (!checkin.questionnaire) {
      checkin.questionnaire = {};
    }

    callback(checkin);
  };
};
