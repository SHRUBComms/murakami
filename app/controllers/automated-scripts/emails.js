const CronJob = require("cron").CronJob;
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;

const Mail = require(rootDir + "/app/controllers/mail/root");

const automatedMails = new CronJob({
  cronTime: "0 0 10 * * *",
  onTick: async () => {
    try {
     
      let memberMails = {};
      
      const { membersArray } = await Members.getAll();
      let sanitizedMembers = [];

      for await (const member of membersArray) {
        const sanitizedMember = await Members.sanitizeMember(member, { permissions: { members: { name: true, contactDetails: true, membershipDates: true } } });

        if(sanitizedMember) {
          sanitizedMembers.push(sanitizedMember);
        }
      }
      
      for await (const member of sanitizedMembers) {
        try {

          if(member.current_exp_membership == "never") {
            throw "Membership doesn't expire"
          }   

          if(!moment(String(member.current_exp_membership)).isValid()) {
            throw "Invalid expiration date";
          }
          const today = moment().startOf("day").format("YYYY-MM-DD");
          if(!member.status && member.is_member == 1) {

            // Behaviour change survey
            if(member.contactPreferences) {
              if(member.contactPreferences.behaviourChangeSurvey) {
                if(moment(member.current_init_membership).add(3, "months").isSame(moment())) {
                  try {
                    memberMails[member.member_id].push("behaviour-survey");
                  } catch (error) {
                    memberMails[member.member_id] = ["behaviour-survey"];
                  }
                }
              }
            }

            if (moment(member.current_exp_membership).format("YYYY-MM-DD") == today) {
              // Membership expiring today.
              try {
                memberMails[member.member_id].push("goodbye");
              } catch (error) {
                memberMails[member.member_id] = ["goodbye"];
              }

              //await Members.updateStatus(member.member_id, 0);
            } else if (moment(member.current_exp_membership).isBefore(today)) {
              // Membership already expired - revoke membership silently
              //await Members.updateStatus(member.member_id, 0);
            } else if (moment(member.current_exp_membership).format("YYYY-MM-DD") == moment(today).add(1, "months").format("YYYY-MM-DD")) {
              // Membership due to expire in one months time
              try {
                memberMails[member.member_id].push("renewal-notice-long");
              } catch (error) {
                memberMails[member.member_id] = ["renewal-notice-long"];
              }
            } else if (moment(member.current_exp_membership).format("YYYY-MM-DD") == moment(today).add(1, "week").format("YYYY-MM-DD")) {
              // Membership due to expire in one weeks times
              try {
                memberMails[member.member_id].push("renewal-notice-short");
              } catch (error) {
                memberMails[member.member_id] = ["renewal-notice-short"];
              }
            }
          } else {
            if (moment(member.current_exp_membership).add(5, "years").add(6, "months").format("YYYY-MM-DD") == moment(today).format("YYYY-MM-DD")) {
              // Membership has been inactive for 5 and a half years
              //await Members.redact(member.member_id);
            }
          }
        } catch (error) {
          console.error(error);
        }
      }

      for await (const member_id of Object.keys(memberMails)) {
        const membersMail = memberMails[member_id];
        for await (const mail of membersMail) {
          try {
            await Mail.sendAutomatedMember(mail, member_id, {});
          } catch (error) {
            console.log(error);
          }  
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
  start: false,
  timeZone: "Europe/London"
});

module.exports = automatedMails;
