var CronJob = require("cron").CronJob;
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

var rootDir = process.env.CWD;
var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;
var Volunteers = Models.Volunteers;
var Transactions = Models.Transactions;
var MailTemplates = Models.MailTemplates;

var Mail = require(rootDir + "/app/configs/mail");

var automatedMails = new CronJob({
  cronTime: "0 30 9 * * *",
  onTick: function() {
    // Async email.
    var memberMails = {};
    // Begone expired members!
    Members.getAll(function(err, members) {
      var sanitizedMembers = [];
      async.eachOf(
        members,
        function(member, i, callback) {
          Members.sanitizeMember(
            member,
            {
              permissions: {
                members: {
                  name: true,
                  contactDetails: true,
                  membershipDates: true
                }
              }
            },
            function(err, sanitizedMember) {
              if (sanitizedMember) {
                sanitizedMembers.push(sanitizedMember);
              }
              callback();
            }
          );
        },
        function() {
          async.each(
            sanitizedMembers,
            function(member, callback) {
              var today = moment()
                .startOf("day")
                .format("YYYY-MM-DD");

              if (!member.status && member.is_member == 1) {
                if (member.activeVolunteer == 1) {
                  try {
                    if (
                      member.contactPreferences.volunteeringOpportunities ==
                      true
                    ) {
                      // Volunteering opportunities
                    }
                  } catch (err) {}
                }

                if (
                  moment(member.current_exp_membership).format("YYYY-MM-DD") ==
                  today
                ) {
                  // Membership expiring today.
                  try {
                    memberMails[member.member_id].push("goodbye");
                  } catch (err) {
                    memberMails[member.member_id] = ["goodbye"];
                  }

                  Members.updateStatus(member.member_id, 0, function(err) {});
                } else if (
                  moment(member.current_exp_membership).isBefore(today)
                ) {
                  Members.updateStatus(member.member_id, 0, function(err) {});
                } else if (
                  moment(member.current_exp_membership).format("YYYY-MM-DD") ==
                  moment(today)
                    .add(1, "months")
                    .format("YYYY-MM-DD")
                ) {
                  try {
                    memberMails[member.member_id].push("renewal_notice_long");
                  } catch (err) {
                    memberMails[member.member_id] = ["renewal_notice_long"];
                  }
                } else if (
                  moment(member.current_exp_membership).format("YYYY-MM-DD") ==
                  moment(today)
                    .add(1, "week")
                    .format("YYYY-MM-DD")
                ) {
                  // Expires in one week
                  try {
                    memberMails[member.member_id].push("renewal_notice_short");
                  } catch (err) {
                    memberMails[member.member_id] = ["renewal_notice_short"];
                  }
                }
              } else {
                if (
                  moment(member.current_exp_membership)
                    .add(5, "years")
                    .add(6, "months")
                    .format("YYYY-MM-DD") == moment(today).format("YYYY-MM-DD")
                ) {
                  Members.redact(member.member_id, function(err) {});
                }
              }
              callback();
            },
            function() {
              async.eachOf(
                memberMails,
                function(membersMail, member_id, callback) {
                  async.each(
                    membersMail,
                    function(mail, callback) {
                      Mail.sendAutomated(mail, member_id, function(err) {
                        callback();
                      });
                    },
                    function() {
                      callback();
                    }
                  );
                },
                function() {}
              );
            }
          );
        }
      );
    });
  },
  start: false,
  timeZone: "Europe/London"
});

module.exports = automatedMails;
