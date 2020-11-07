module.exports = (VolunteerRoles, sequelize, DataTypes) => {
  	const Helpers = require(process.env.CWD + "/app/controllers/helper-functions/root");
  	const GetId = async () => {
    		const id = Helpers.generateBase64Id(10);
    		const result = await VolunteerRoles.findAll({ where: { role_id: id } });
      		if (result.length > 0) {
        		GetId();
      		} else if (result.length == 0) {
        		return id;
      		}
  	}
	return GetId;
}
