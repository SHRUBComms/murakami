module.exports = (Settings, sequelize, DataTypes) => {
	return async() => {
		try {
			let settings = await Settings.findAll({});
			return settings.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {});
		} catch(error) {
			throw error;
		}
	}
}
