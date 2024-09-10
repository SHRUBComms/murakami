module.exports = (VolunteerHours, sequelize, DataTypes) => {
  return async (shift) => {
    try {
      console.log(shift);
      const shift_id = await VolunteerHours.generateId();
      await VolunteerHours.create({
        shift_id: shift_id,
        member_id: shift.member_id,
        date: shift.date || new Date(),
        duration_as_decimal: shift.duration,
        working_group: shift.working_group,
        note: shift.note || null,
        approved: shift.approved,
      });

      return shift_id;
    } catch (error) {
      throw error;
    }
  };
};
