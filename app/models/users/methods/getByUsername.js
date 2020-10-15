module.exports = (Users, sequelize, DataTypes) => {
	return async (username) => {
    		return Users.findOne({ where: { username: username } });
	}
}
