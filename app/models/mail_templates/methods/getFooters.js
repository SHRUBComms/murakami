module.exports = (MailTemplates, sequelize, DataTypes) => {
	return async () => {
    		const footers = await MailTemplates.findAll({
			where: { category: "footers" },
      			raw: true
    		});

		let footersObj = {};

		for await (const footer of footers) {

	          	if (footer.mail_id == "footer") {
            			footersObj.members = footer;
          		}

          		if (footer.mail_id == "generic-footer") {
            			footersObj.generic = footer;
          		}
		}

		return footersObj;
  	}
}
