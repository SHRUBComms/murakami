const sanitizeHtml = require("sanitize-html");

module.exports = () => {
	return async (collection, organisations, members) => {
    		try {
			if (members[collection.member_id]) {
				collection.collectedBy = members[collection.member_id].first_name + " " + members[collection.member_id].last_name;
			} else {
				collection.collectedBy = "Unknown";
			}

			if (!collection.note) {
				collection.note = "-";
			} else if (collection.note == "null") {
				collection.note = "-";
			} else {
				collection.note = sanitizeHtml(collection.note);
			}

			collection.amountPortion = collection.amount / collection.destination_organisations.length;

			if (organisations[collection.collection_organisation_id]) {
				 collection.collectedFrom = organisations[collection.collection_organisation_id].name;
			} else {
				collection.collectedFrom = "Unknown";
			}

			collection.droppedOffTo = "";

			for await (const organisation_id of collection.destination_organisations) {

				if (organisations[organisation_id]) {
					collection.droppedOffTo += organisations[organisation_id].name;
				} else {
					collection.droppedOffTo += "Unknown";
				}

				if(collection.destination_organisations.indexOf(organisation_id) != collection.destination_organisations.length - 1) {
					collection.droppedOffTo += ", ";
				}
			}

			return collection;
		} catch (error) {
			throw error;
		}
	}
}
