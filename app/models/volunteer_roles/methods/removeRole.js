module.exports = (VolunteerRoles, sequelize, DataTypes) => {
	return async (role_id) => {
    		return VolunteerRoles.update({ public: 0, removed: 1 }, { where: { role_id: role_id } });
  	}
}
