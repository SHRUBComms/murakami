module.exports = (VolunteerHours, sequelize, DataTypes) => {
	return async (member_id) => {
    		return VolunteerHours.findAll({ where: { member_id: member_id, approved: 1 }, order: [["date", "DESC"]]})
  	}
}
