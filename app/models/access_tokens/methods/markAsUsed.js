module.exports = (AccessTokens, sequelize, DataTypes) => {
	return async (token) => {
    		return AccessTokens.update({ used: 1 }, { where: { token: token } });
  	}
}
