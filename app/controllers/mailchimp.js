const Mailchimp = require("mailchimp-api-v3");
const md5 = require("md5");

let MailchimpAPI = {}

MailchimpAPI.subscribeToNewsletter = async (newsletterId, newsletterSecret, member) => {
	try {
		const newsletter = new Mailchimp(process.env.SHRUB_MAILCHIMP_SECRET_API_KEY);

		let subscribeBody = {
			email_address: member.email,
			status: "subscribed",
			merge_fields: {
				FNAME: member.first_name,
				LNAME: member.last_name
			}
		};


		const response = await newsletter.put("/lists/" + process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID + "/members/" + md5(member.email), subscribeBody);

		subscribeBody.marketing_permissions = [
			{
				marketing_permission_id:
				response.marketing_permissions[0].marketing_permission_id,
				text: response.marketing_permissions[0].text,
				enabled: true
			}
		];

		await newsletter.put("/lists/" + process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID + "/members/" + md5(member.email), subscribeBody);
		return true;
	} catch (error) {
		throw error;
	}
}

MailchimpAPI.unsubscribeFromNewsletter = async (newsletterId, newsletterSecret, member) => {
	try {
		const subscribeBody = {
			email_address: member.email,
			status: "subscribed",
			merge_fields: {
				FNAME: member.first_name,
				LNAME: member.last_name
			}
		};

		const newsletter = new Mailchimp(newsletterSecret);
		const result = await newsletter.delete("/lists/" + process.env.SHRUB_MAILCHIMP_NEWSLETTER_LIST_ID + "/members/" + md5(member.email));
		return true;
	} catch (error) {
		throw error;
	}
}

MailchimpAPI.isSubscribedToNewsletter = async (newsletterId, newsletterSecret, email) => {
	try {
		const newsletter = new Mailchimp(newsletterSecret);
		const response = await newsletter.get({ path: "/lists/" + newsletterId + "/members/" + md5(email) });
		return true;
	} catch (error) {
		return false;
	}
}

module.exports = MailchimpAPI;
