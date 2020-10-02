var CronJob = require("cron").CronJob;
var async = require("async");
var moment = require("moment");
moment.locale("en-gb");

// Import models etc.
var rootDir = process.env.CWD;
var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;
var Volunteers = Models.Volunteers;
var VolunteerHours = Models.VolunteerHours;
var Reports = Models.Reports;

var automatedReports = new CronJob({
  // 9am, first of the month.
  cronTime: "0 0 10 1 * *",
  onTick: function() {
    var startOfMonth = moment()
      .subtract(1, "days")
      .startOf("month");

    // Members
    // Number of current members and active volunteers
    var report = {
	    members: { current: 0, new: 0, newFree: 0, newPaid: 0, renewed: 0, renewedPaid: 0, renewedFree: 0, expired: 0 },
      volunteers: {
        registered: 0,
        volunteered: 0,
        hours: { total: 0, byGroup: {} }
      }
    };

    Members.getAllCurrentMembers(function(err, members) {
      report.members.current = members.length;
      Volunteers.getByGroupId(
        null,
        {
          permissions: {
            members: { name: true, membershipDates: true },
            volunteers: { roles: true }
          }
        },
        function(err, volunteers) {
          report.volunteers.registered = Object.keys(volunteers).length;
          async.each(
            members,
            function(member, callback) {
              // new members this month
              if (
                member.earliest_membership_date ==
                  member.current_init_membership &&
                moment(member.current_init_membership)
                  .startOf("month")
                  .isSame(startOfMonth)
              ) {
                report.members.new += 1;
		if(member.free){
			report.members.newFree += 1;
		} else {
			report.members.newPaid += 1;
		}
              } else if (
                moment(member.current_exp_membership)
                  .startOf("month")
                  .isSame(startOfMonth)
              ) {
                report.members.expired += 1;
              } else if (
                !moment(member.earliest_membership_date).isSame(
                  member.current_init_membership
                ) &&
                moment(member.current_init_membership)
                  .startOf("month")
                  .isSame(startOfMonth)
              ) {
                report.members.renewed += 1;
		if(member.free) {
			report.members.renewedFree += 1;
		} else {
			report.members.renewedPaid += 1;
		}
              }
              callback();
            },
            function() {
              VolunteerHours.getAllApprovedBetweenTwoDates(
                moment(startOfMonth).toDate(),
                moment(startOfMonth)
                  .endOf("month")
                  .toDate(),
                function(err, shifts) {
                  var volunteered = {};
                  async.each(
                    shifts,
                    function(shift, callback) {
                      if (
                        !report.volunteers.hours.byGroup[shift.working_group]
                      ) {
                        report.volunteers.hours.byGroup[
                          shift.working_group
                        ] = 0;
                      }

                      report.volunteers.hours.total +=
                        shift.duration_as_decimal;
                      report.volunteers.hours.byGroup[shift.working_group] +=
                        shift.duration_as_decimal;

                      if (!volunteered[shift.member_id]) {
                        report.volunteers.volunteered += 1;
                        volunteered[shift.member_id] = true;
                      }

                      callback();
                    },
                    function() {
                      Reports.addReport("membership", report, function(err) {});
                    }
                  );
                }
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

module.exports = automatedReports;
