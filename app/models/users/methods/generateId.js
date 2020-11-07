module.exports = (Users, sequelize, DataTypes) => {
	const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");
  	const GetId = async () => {
    		const id = Helpers.generateIntId(11);
    		const result = await Users.findAll({ where: { id: id } });
      		if (result.length > 0) {
        		GetId();
      		} else if (result.length == 0) {
        		return id;
      		}
	}
  	return GetId;
}
