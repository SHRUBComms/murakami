const rootDir = process.env.CWD;
const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

module.exports = (Users, sequelize, DataTypes) => {
	return async (user) => {
		try {
			const coordinators = await Users.findAll({
				where: {
					class: { [DataTypes.Op.or]: ["staff", "admin", "volunteer"] }
				}
			});

			const coordinatorsObj = coordinators.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {});

			const coordinatorIds = Helpers.flattenToIds(coordinators, "id");

			return { coordinators, coordinatorsObj, coordinatorIds}
		} catch (error) {
			throw error;
		}
	}
}
