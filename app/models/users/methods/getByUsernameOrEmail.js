module.exports = (Users, sequelize, DataTypes) => {
	return async (usernameOrEmail, callback) => {
		try {
			const user = Users.findOne(
				{
					where: {
						[DataTypes.Op.or]: [
							{ email: usernameOrEmail },
							{ username: usernameOrEmail }
						]
					}
				}
			);

			if(user) {
				return user;
			} else {
				return null;
			}

		} catch(error) {
			throw error;
		}
	}
}
