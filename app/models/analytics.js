var con = require("./index");
var mysql = require("mysql");

var Analytics = {};

Analytics.getVolunteerHours = function(working_group, callback) {
  if (working_group) {
    var query =
      "SELECT date, SUM(duration_as_decimal) totalCount FROM volunteer_hours WHERE working_group = ? GROUP BY DATE(date)";
    var inserts = [working_group];
    var sql = mysql.format(query, inserts);
  } else {
    var sql =
      "SELECT date, SUM(duration_as_decimal) totalCount FROM volunteer_hours WHERE working_group LIKE '%' GROUP BY DATE(date)";
  }

  con.query(sql, function(err, results) {
    var analytic = {
      data: {
        labels: [],
        datasets: [
          {
            label: "Hours Volunteered",
            data: []
          }
        ]
      }
    };

    for (let i=0; i < results.length; i++) {
      analytic.data.labels[i] = results[i].date;
      analytic.data.datasets[0].data[i] = results[i].totalCount;
    }

    callback(analytic);
  });
};

module.exports = Analytics;
