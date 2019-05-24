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

var automatedMails = new CronJob({
  cronTime: "0 30 9 * * *",
  onTick: function() {
    // Async email.

    var memberMails = {};
    // Begone expired members!
    Members.getAllCurrentMembers(
      { permissions: { members: { name: true, contactDetails: true } } },
      function(err, members) {
        async.each(
          members,
          function(member, callback) {
            if (member.activeVolunteer == 1) {
              try {
                if (
                  member.contactPreferences.volunteeringOpportunities == true
                ) {
                }
              } catch (err) {}

              callback();
            } else {
              if (
                moment(member.current_exp_membership).format("YYYY-MM-DD") ==
                  moment().format("YYYY-MM-DD") &&
                member.current_exp_membership != member.current_init_membership
              ) {
                try {
                  memberMails[member.member_id].push("goodbye");
                } catch (err) {
                  memberMails[member.member_id] = ["goodbye"];
                }

                Members.updateStatus(member.member_id, 0, function(err) {});
              } else if (
                moment(member.current_exp_membership).isBefore(
                  moment().format("YYYY-MM-DD")
                )
              ) {
                Members.updateStatus(member.member_id, 0, function(err) {});
              } else if (
                moment(member.current_exp_membership).format("YYYY-MM-DD") ==
                moment()
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
                moment()
                  .add(1, "week")
                  .format("YYYY-MM-DD")
              ) {
                try {
                  memberMails[member.member_id].push("renewal_notice_short");
                } catch (err) {
                  memberMails[member.member_id] = ["renewal_notice_short"];
                }
              }

              callback();
            }
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

    Members.getExpired(function(err, members) {
      // TODO: extend expired members membership by 2 months if volunteered relatively frequently
      async.each(
        members,
        function(member, callback) {
          Members.updateStatus(member.member_id, 0, function(err) {
            callback();
          });
        },
        function() {}
      );
    });

    // Redact personal info of 2+ year old members
    Members.getExpiredTwoYearsAgo(function(err, members) {
      async.each(
        members,
        function(member, callback) {
          Members.redact(member.member_id, function(err) {
            callback();
          });
        },
        function() {}
      );
    });
  },
  start: false,
  timeZone: "Europe/London"
});

module.exports = automatedMails;
