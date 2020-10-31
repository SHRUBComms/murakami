module.exports = () => {
  return async (checkin) => {
    if (!checkin.questionnaire) {
      checkin.questionnaire = {};
    }
    return checkin;
  };
};
