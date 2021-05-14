module.exports = (VolunteerRoles, sequelize, DataTypes) => {
	return async (role) => {
    		const roleId = await VolunteerRoles.generateId();
      		const groupId = role.working_group;
      		delete role.working_group;

      		const availability = role.availability;
      		delete role.availability;

      		await VolunteerRoles.create({
        		role_id: roleId,
        		group_id: groupId,
        		details: role,
        		availability: availability,
        		dateCreated: new Date(),
            dateUpdated: new Date(),
            public: 0
      		});

		return roleId;
  	}
}
