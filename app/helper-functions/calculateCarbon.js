module.exports = async (carbon, carbonCategories) => {
	let totalCarbon = 0;
	for await (const transaction of carbon) {
		for await (const carbon_id of Object.keys(transaction.trans_object)) {
			if(carbonCategories[carbon_id]) {
				totalCarbon += Math.abs(transaction.trans_object[carbon_id] * carbonCategories[carbon_id].factors[transaction.method]);
			}
		}
	}

	return totalCarbon;
}
