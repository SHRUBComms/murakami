module.exports = (Volunteers, sequelize, DataTypes) => {
	return async (member_id, roles) => {
    		return Volunteers.update({ roles: roles }, { where: { member_id: member_id } });
	}
};
