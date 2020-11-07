module.exports = function(FoodCollectionsKeys, sequelize, DataTypes) {
	const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");
  	const GetId = async () => {
    		const id = Helpers.generateBase64Id(16);
	    	const result = await FoodCollectionsKeys.findAll({ where: { key: id } });
	      	if (result.length > 0) {
			GetId();
	      	} else if (result.length == 0) {
			return id;
	      	}
	};

  	return GetId;
};
