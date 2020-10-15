const moment = require("moment");

module.exports = (AccessTokens, sequelize, DataTypes) => {
	return async (token, callback) => {
    		return AccessTokens.findOne({ where: { token: token } });
      	}
}
