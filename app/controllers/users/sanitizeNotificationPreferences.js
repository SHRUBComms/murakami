const blankNotificationPreferences = {
      	"pending-volunteer-hours": {
		email: "off",
		murakami: "off"
      	},
      	"volunteers-need-to-volunteer": {
		email: "off",
		murakami: "off"
      	},
      	"unfinished-roles": {
		email: "off",
		murakami: "off"
	}
};


const sanitizeNotificationPreferences = async (notificationPreferences) => {
	try {
		let sanitizedNotificationPreferences = blankNotificationPreferences;

		for await (const notification of Object.keys(blankNotificationPreferences)) {
			if(notificationPreferences[notification]) {
				if(notificationPreferences[notification].email) {
					sanitizedNotificationPreferences[notification].email = "on";
				} else {
					sanitizedNotificationPreferences[notification].email = "off";
				}

				if(notificationPreferences[notification].murakami) {
					sanitizedNotificationPreferences[notification].murakami = "on";
				} else {
					sanitizedNotificationPreferences[notification].murakami = "off";
				}
			}
		}

		return sanitizedNotificationPreferences
	} catch (error) {
		return false;
	}
}

module.exports = sanitizeNotificationPreferences;
