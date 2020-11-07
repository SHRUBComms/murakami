module.exports = (AccessTokens, sequelize, DataTypes) => {
	const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");
  	const GetId = async () => {
    		const id = Helpers.generateBase64Id(25);
	    	const result = await AccessTokens.findAll({ where: { token: id } });
		if (result.length > 0) {
			GetId();
		} else if (result.length == 0) {
			return id;
		}

	};

	return GetId;
};
