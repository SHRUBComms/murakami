module.exports = (VolunteerCheckIns) => {
  return async (checkin_id) => {
    const checkin = await VolunteerCheckIns.findOne({ where: { checkin_id: checkin_id } });
    if(checkin) {
      const sanitizedCheckin = await VolunteerCheckIns.sanitizedCheckIn(checkin);
      return sanitizedCheckin;
    } else {
      return null;
    }
  }
}
