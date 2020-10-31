module.exports = (Transactions, sequelize, DataTypes) => {
	return async (member_id) => {
    		const query = `SELECT transactions.*, tills.name AS till_name FROM transactions
  				INNER JOIN tills ON transactions.till_id=tills.till_id AND transactions.member_id = ?
  				ORDER BY date DESC`;
    		const inserts = [member_id];
    		const transactions = await sequelize.query(query, { replacements: inserts })
        	return transactions[0];
  	}
}
