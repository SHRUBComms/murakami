const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const dynamicVariablesAvailable = require(rootDir + "/app/controllers/mail/dynamicVariables.config");
const GetFooter = require("./getFooter");

const Models = require(rootDir + "/app/models/sequelize");
const VolunteerRoles = Models.VolunteerRoles;
const WorkingGroups = Models.WorkingGroups;
const Members = Models.Members;
const MailTemplates = Models.MailTemplates;

module.exports = (Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) => {
	return async (mail_id, member_id, extraFields) => {
		try {
    			let template = await MailTemplates.getById(mail_id);

			if (!template) {
				throw "Template not found";
			}

        		if (template.active != 1) {
				throw "Template";
			}

			const memberPermissions = {
				class: "admin",
              			permissions: {
                			members: {
                  				contactDetails: true,
                  				name: true,
                  				membershipDates: true,
                  				balance: true
                			}
				}
			}

			let member = await Members.getById(member_id, memberPermissions);

			if(!member) {
				throw "Member not found";
			}

			member = Object.assign(member, extraFields);

			const footer = await GetFooter(member_id);

			if (footer) {
                    		template.markup += "<hr />" + footer;
                  	}

			for await (const variableName of Object.keys(dynamicVariablesAvailable)) {
				const regex = new RegExp("\\|" + variableName + "\\|", "g");
				if (member[variableName]) {
					template.markup = template.markup.replace(regex, member[variableName]);
				}
			}

			const message = {
				html: template.markup,
				from: "SHRUB Coop <membership@shrubcoop.org>",
				to: `${member.first_name} ${member.last_name} <${member.email}>`,
				subject: template.subject

			};

			const transporter = nodemailer.createTransport(Mail.supportSmtpConfig);
			transporter.use("compile", htmlToText());
			return transporter.sendMail(message);

		} catch (error) {
			throw error;
		}
	}
}
