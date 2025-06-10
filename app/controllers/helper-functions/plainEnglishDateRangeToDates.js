const moment = require("moment");
moment.locale("en-gb");

module.exports = async (period, startDate, endDate) => {
  let formattedStartDate, formattedEndDate;

  try {
    if (period == "custom") {
      if (startDate && endDate) {
        formattedStartDate = moment(startDate).startOf("day").toDate();
        formattedEndDate = moment(endDate).endOf("day").toDate();
      } else {
        throw Error;
      }
    } else {
      // Current time periods:
      // "week", "month", "year", "all-time"
      if (period == "week") {
        formattedStartDate = moment().startOf("week").toDate();
        formattedEndDate = moment().endOf("day").toDate();
      } else if (period == "month") {
        formattedStartDate = moment().startOf("month").toDate();
        formattedEndDate = moment().endOf("day").toDate();
      } else if (period == "year") {
        formattedStartDate = moment().startOf("year").toDate();
        formattedEndDate = moment().endOf("day").toDate();
      } else if (period == "all-time") {
        formattedStartDate = moment("1970-01-01").toDate();
        formattedEndDate = moment().endOf("day").toDate();
      }

      // Previous time periods:
      // "yesterday", "last-week", "last-month", "last-year"
      else if (period == "yesterday") {
        formattedStartDate = moment().subtract(1, "days").startOf("day").toDate();
        formattedEndDate = moment().subtract(1, "days").endOf("day").toDate();
      } else if (period == "last-week") {
        formattedStartDate = moment().subtract(1, "weeks").startOf("week").toDate();
        formattedEndDate = moment().subtract(1, "weeks").endOf("week").toDate();
      } else if (period == "last-month") {
        formattedStartDate = moment().subtract(1, "months").startOf("month").toDate();
        formattedEndDate = moment().subtract(1, "months").endOf("month").toDate();
      } else if (period == "last-year") {
        formattedStartDate = moment().subtract(1, "years").startOf("year").toDate();
        formattedEndDate = moment().subtract(1, "years").endOf("year").toDate();
      }

      // Default to "today"
      else {
        formattedStartDate = moment().startOf("day").toDate();
        formattedEndDate = moment().endOf("day").toDate();
      }
    }
  } catch (error) {
    formattedStartDate = moment().startOf("day").toDate();
    formattedEndDate = moment().endOf("day").toDate();
  }

  return { formattedStartDate, formattedEndDate };
};
