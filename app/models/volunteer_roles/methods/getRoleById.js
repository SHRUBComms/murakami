module.exports = (VolunteerRoles, sequelize, DataTypes) => {
  return async (role_id) => {
    try {
      const role = await VolunteerRoles.findOne({ where: { role_id: role_id } });
      if (role) {
        if (Object.keys(role.details).length == 1) {
          role.incomplete = true;
        } else {
          role.incomplete = false;
        }

        role.availability = role.availability || {};
      }

      return role;
    } catch (error) {
      throw error;
    }
  };
};
