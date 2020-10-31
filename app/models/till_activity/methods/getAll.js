module.exports = (TillActivity, sequelize, DataTypes) => {
	return async () => {
    		const query = `SELECT *
                		FROM  till_activity t1
                		WHERE timestamp = (SELECT MAX(timestamp) from till_activity t2 WHERE t1.till_id = t2.till_id)
                		ORDER BY timestamp DESC`;
    		const activity = await sequelize.query(query);
		return activity[0].reduce((obj, item) => Object.assign(obj, { [item.till_id]: item }), {});
	}
}
