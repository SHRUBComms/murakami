var CronJob = require("cron").CronJob;

// Import models etc.
var Members = require("../models/members");
var Volunteers = require("../models/volunteers");
var Reports = require("../models/reports");

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
