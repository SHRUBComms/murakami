module.exports = (Carbon, sequelize, DataTypes) => {
  	return async (member_id) => {
    		return Carbon.findAll({ where: { member_id: member_id } });
    	}
}
