const CronJob = require("cron").CronJob;
const moment = require("moment");
moment.locale("en-gb");

// Import models etc.
const rootDir = process.env.CWD;

const Models = require(rootDir + "/app/models/sequelize");
const Members = Models.Members;
const Volunteers = Models.Volunteers;
const VolunteerHours = Models.VolunteerHours;
const Reports = Models.Reports;

const automatedReports = new CronJob({
  // 2am, first of the month.
  cronTime: "0 0 2 1 * *",
  onTick: async () => {
    try {
      const startOfMonth = moment().subtract(1, "days").startOf("month");

      const report = {
        members: {
          current: 0,
          new: 0,
          newFree: 0,
          newPaid: 0,
          renewed: 0,
          renewedPaid: 0,
          renewedFree: 0,
          expired: 0,
        },
        volunteers: {
          registered: 0,
          volunteered: 0,
          hours: { total: 0, byGroup: {} },
        },
      };

      const members = await Members.getAllCurrentMembers();
      report.members.current = members.length;

      const { volunteers } = await Volunteers.getByGroupId(null, {
        permissions: {
          members: { name: true, membershipDates: true },
          volunteers: { roles: true },
        },
      });
      report.volunteers.registered = volunteers.length;

      for await (const member of members) {
        if (
          member.earliest_membership_date == member.current_init_membership &&
          moment(member.current_init_membership).startOf("month").isSame(startOfMonth)
        ) {
          report.members.new += 1;
          if (member.free) {
            report.members.newFree += 1;
          } else {
            report.members.newPaid += 1;
          }
        } else if (moment(member.current_exp_membership).startOf("month").isSame(startOfMonth)) {
          report.members.expired += 1;
        } else if (
          !moment(member.earliest_membership_date).isSame(member.current_init_membership) &&
          moment(member.current_init_membership).startOf("month").isSame(startOfMonth)
        ) {
          report.members.renewed += 1;
          if (member.free) {
            report.members.renewedFree += 1;
          } else {
            report.members.renewedPaid += 1;
          }
        }
      }

      const shifts = await VolunteerHours.getAllApprovedBetweenTwoDates(
        moment(startOfMonth).toDate(),
        moment(startOfMonth).endOf("month").toDate()
      );

      const volunteered = {};
      for await (const shift of shifts) {
        if (!report.volunteers.hours.byGroup[shift.working_group]) {
          report.volunteers.hours.byGroup[shift.working_group] = 0;
        }

        report.volunteers.hours.total += Number(shift.duration_as_decimal);
        report.volunteers.hours.byGroup[shift.working_group] += Number(shift.duration_as_decimal);

        if (!volunteered[shift.member_id]) {
          report.volunteers.volunteered += Number(1);
          volunteered[shift.member_id] = true;
        }
      }

      await Reports.addReport("membership", report);
    } catch (error) {
      console.error(error);
    }
  },
  start: false,
  timeZone: "Europe/London",
});

module.exports = automatedReports;
