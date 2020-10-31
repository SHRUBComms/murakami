module.exports = (Members, sequelize, DataTypes) => {
  	return async (member_id, free) => {
    		const query = "UPDATE members SET free = ? WHERE member_id = ?";
    		return Members.update({ free: free }, { where: { member_id: member_id } });
	}
}
