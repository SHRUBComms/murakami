module.exports = (AccessTokens, sequelize, DataTypes) => {
	return async (expirationTimestamp, details) => {
		try {
			const token = await AccessTokens.generateId();
			await AccessTokens.create({
				token: token,
				expirationTimestamp: expirationTimestamp,
				details: details,
				used: 0
			});
			return token;
		} catch(error) {
			throw error;
		}
	};
};
