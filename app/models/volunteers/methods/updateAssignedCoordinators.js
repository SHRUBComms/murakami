module.exports = (Volunteers, sequelize, DataTypes) => {
	return async (member_id, assignedCoordinators) => {
    		return Volunteers.update({ assignedCoordinators: assignedCoordinators }, { where: { member_id: member_id } });
  	};
};
