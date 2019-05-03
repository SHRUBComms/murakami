var CronJob = require("cron").CronJob;

// Import models etc.
var rootDir = process.env.CWD;
var Models = require(rootDir + "/app/models/sequelize");

var Members = Models.Members;
var Volunteers = Models.Volunteers;
var Reports = Models.Reports;

var automatedReports = new CronJob({
  cronTime: "0 0 0 1 * *",
  onTick: function() {
    // Members
    // Number of current members and active volunteers
    var report = {};
    Members.getAllCurrentMembers(function(err, members) {
      report.currentMembers = members.length;
      Volunteers.getByGroupId(
        null,
        {
          permissions: {
            members: { name: true },
            volunteers: { roles: true }
          }
        },
        function(err, volunteers) {
          report.currentVolunteers = Object.keys(volunteers).length;

          Reports.add("membership", report, function(err) {
            console.log(err);
          });
        }
      );
    });
  },
  start: false,
  timeZone: "Europe/London"
});

module.exports = automatedReports;
