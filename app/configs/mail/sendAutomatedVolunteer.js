const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const dynamicVariablesAvailable = require(rootDir + "/app/configs/mail/dynamicVariables.config");
const GetFooter = require("./getFooter");

const Models = require(rootDir + "/app/models/sequelize");
const Volunteers = Models.Volunteers;
const VolunteerRoles = Models.VolunteerRoles;
const WorkingGroups = Models.WorkingGroups;
const Members = Models.Members;
const MailTemplates = Models.MailTemplates;

module.exports = (Mail, nodemailer, htmlToText, sanitizeHtml, cleaner) => {
	return async (mail_id, member_id) => {
		try {
    			let template = await MailTemplates.getById(mail_id);
      			if (!template) {
				throw "Template not found";
			}

        		if (template.active != 1) {
				throw "Templates not active";
			}

			const { allWorkingGroupsObj } = await WorkingGroups.getAll();
              		const { allVolunteerRoles } = await VolunteerRoles.getAll();

			const memberPermissions = {
				class: "admin",
				permissions: {
					members: {
						contactDetails: true,
						workingGroups: true,
						name: true,
						membershipDates: true,
						balance: true
					}
				}
			}

			const volunteerPermissions = {
				class: "admin",
				permissions: {
					volunteers: {
						roles: true,
						dates: true,
						roles: true,
						shiftHistory: true,
						assignedCoordinators: true,
						manageFoodCollectionLink: true
					}
				},
				allVolunteerRoles: allVolunteerRoles,
				allWorkingGroupsObj: allWorkingGroupsObj
			};

			const member = await Members.getById(member_id, memberPermissions);

                      	if (!member) {
				throw "Member not found";
			}

			const volunteer = await Volunteers.getVolunteerById(member_id, volunteerPermissions);

                        if (!volunteer) {
				throw "Member is not volunteer";
			}

			const footer = await GetFooter(member_id);

			if (footer) {
				template.markup += "<hr />" + footer;
			}

			for await (const variableName of Object.keys(dynamicVariablesAvailable)) {
				const regex = new RegExp("\\|" + variableName + "\\|", "g");
				if (member[variableName]) {
					template.markup = template.markup.replace(regex, member[variableName]);
				} else if (volunteer[variableName]) {
					template.markup = template.markup.replace(regex, volunteer[variableName]);
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
