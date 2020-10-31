module.exports = (Tills, sequelize, DataTypes) => {
  return async () => {
    const tills = await Tills.findAll({});
		const tillsObj = tills.reduce((obj, item) => Object.assign(obj, { [item.till_id]: item }), {});
		return { tills, tillsObj };
	}
}
