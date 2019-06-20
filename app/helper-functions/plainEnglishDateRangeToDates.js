var moment = require("moment");
moment.locale("en-gb");

module.exports = function(period, startDate, endDate, callback) {
  try {
    if (period == "custom") {
      if (startDate && endDate) {
        startDate = moment(startDate)
          .startOf("day")
          .toDate();
        endDate = moment(endDate)
          .endOf("day")
          .toDate();
      }
    } else {
      endDate = moment()
        .endOf("day")
        .toDate();

      if (period == "all-time") {
        startDate = moment("1970-01-01").toDate();
      } else if (period == "year") {
        startDate = moment()
          .startOf("year")
          .toDate();
      } else if (period == "month") {
        startDate = moment()
          .startOf("month")
          .toDate();
      } else if (period == "week") {
        startDate = moment()
          .startOf("week")
          .toDate();
      } else {
        startDate = moment()
          .startOf("day")
          .toDate();
      }
    }
  } catch (err) {
    startDate = moment()
      .startOf("day")
      .toDate();

    endDate = moment()
      .endOf("day")
      .toDate();
  }

  callback(startDate, endDate);
};
