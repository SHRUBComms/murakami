const async = require("async");

module.exports = (VolunteerRoles, sequelize, DataTypes) => {
	return async () => {
		const roles = await VolunteerRoles.findAll({ order: [["dateCreated", "DESC"]] });
        	let rolesGroupedByGroup = {};
        	let rolesGroupedById = {};

		for await (const role of roles) {
			if (Object.keys(role.details).length == 1) {
              			role.incomplete = true;
            		} else {
              			role.incomplete = false;
            		}

            		if (!rolesGroupedByGroup[role.group_id]) {
              			rolesGroupedByGroup[role.group_id] = [role];
            		} else {
              			rolesGroupedByGroup[role.group_id].push(role);
            		}

            		rolesGroupedById[role.role_id] = role;

			return { rolesArray: roles, rolesObj: rolesGroupedById, rolesByGroup: rolesGroupedByGroup }
		}
  	}
}
