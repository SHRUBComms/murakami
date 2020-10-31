module.exports = (VolunteerCheckIns) => {
  return async (member_id, user_id, questionnaire) => {
    const checkinId = await VolunteerCheckIns.generateId();
    return VolunteerCheckIns.create({
      checkin_id: checkinId,
      member_id: member_id,
      user_id: user_id,
      questionnaire: questionnaire,
      timestamp: new Date()
    });
  }
}
