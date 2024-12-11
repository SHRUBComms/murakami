const CronJob = require("cron").CronJob;
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;
const Models = require(rootDir + "/app/models/sequelize");
const SumupTransactions = Models.SumupTransactions;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

async function getPrevDate() {
  try {
    const latestRecord = await SumupTransactions.findOne({
      attributes: ["timestamp"],
      order: [["timestamp", "DESC"]],
    });

    if (latestRecord && latestRecord.dataValues.timestamp) {
      return moment(latestRecord.dataValues.timestamp);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching backfill date:", error);
    throw error;
  }
}

const reconcileSumupTransactions = new CronJob({
  cronTime: "0 3 * * *",
  onTick: async () => {
    console.log("we are running");

    // Set backfill dates
    const startDate = await getPrevDate();
    const endDate = moment();

    // Set access token
    const accessToken = await Helpers.SumUpAuth();
    if (!accessToken) {
      throw "Something went wrong contacting SumUp";
    }

    // Get all new SumUp transactions
    let records;
    if (startDate) {
      const adjustedStartDate = startDate.add(1, "days");
      records = await Helpers.sumUpGetAllTransactionsBetweenTwoDates(
        accessToken,
        adjustedStartDate.toDate(),
        endDate.toDate()
      );
    } else {
      records = await Helpers.sumUpGetAllTransactions(accessToken);
    }

    // Insert SumUp transaction records into database
    await Helpers.insertSumUpTransactions(records, SumupTransactions);
  },
  start: false,
  timeZone: "Europe/London",
});

module.exports = reconcileSumupTransactions;
