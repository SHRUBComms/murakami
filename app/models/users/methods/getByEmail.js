module.exports = (Users, sequelize, DataTypes) => {
	return async (email, callback) => {
    		return Users.findOne({ where: { email: email } });
	}
}
