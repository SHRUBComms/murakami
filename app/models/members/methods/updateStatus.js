module.exports = (Members, sequelize, DataType) => {
	return async (member_id, state) => {
    		return Members.update({ is_member: state }, { where: { member_id: member_id } });
	}
}
