module.exports = (VolunteerCheckIns, sequelize) => {
  return async (member_id) => {
    const checkin = await sequelize.max("timestamp", { where: { member_id: member_id } });
    if (checkin[0]) {
      return checkin[0];
    } else {
      return null;
    }
  };
};
