module.exports = (VolunteerRoles, sequelize, DataTypes) => {
  return async (role_id, role) => {
    const groupId = role.working_group;
    delete role.working_group;

    const availability = role.availability;
    delete role.availability;

    console.log("Updating...");
    return VolunteerRoles.update({
      group_id: groupId,
      details: role,
      availability: availability,
      dateUpdated: new Date() 
    },
    { where: { role_id: role_id } })
	}
}
