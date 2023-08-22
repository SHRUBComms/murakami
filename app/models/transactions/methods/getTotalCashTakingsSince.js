module.exports = (Transactions, sequelize, DataTypes) => {
	return async (till_id, timestamp) => {
		const transactions = await Transactions.findAll({
			where: {
				till_id: till_id,
				date: { [DataTypes.Op.between]: [timestamp, new Date()]}
			}
		});

		let totalTakings = 0;
    let totalRefunds = 0;
    let totalReimbursements = 0;

		for await (const transaction of transactions) {
			if(!isNaN(transaction.summary.totals.money)) {
				if (transaction.summary.paymentMethod == "cash") {
          if(transaction.summary.bill[0].item_id == "yoyoCup") {
						totalReimbursements = Number(totalReimbursements) + Number(transaction.summary.totals.money);
          } else if (transaction.summary.bill[0].item_id != "refund") {
						totalTakings = Number(totalTakings) + Number(transaction.summary.totals.money);
					} else {
						totalTakings = Number(totalTakings) + Number(transaction.summary.totals.money);
						totalRefunds = Number(totalRefunds) + Number(transaction.summary.totals.money);
					}
				}
			}
		}

		return { totalTakings, totalRefunds, totalReimbursements };
	}
}
