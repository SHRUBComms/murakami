module.exports = (VolunteerRoles, sequelize, DataTypes) => {
  	return async (role_id, role) => {
    		const groupId = role.working_group;
    		delete role.working_group;

    		const availability = role.availability;
    		delete role.availability;

    		return VolunteerRoles.update({
        		group_id: groupId,
        		details: role,
        		availability: availability
      		},
      		{ where: { role_id: role_id } })
	}
}
