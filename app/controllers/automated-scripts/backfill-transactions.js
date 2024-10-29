const CronJob = require("cron").CronJob;
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;
const Models = require(rootDir + "/app/models/sequelize");
const SumupTransactions = Models.SumupTransactions;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

// Backfill date
const specifiedDate = new Date("2024-11-01");

const backfillSumupTransactions = new CronJob({
  cronTime: "0 2 * * *",
  onTick: async () => {
    // Only run backfill on the specified date
    const now = new Date();
    if (now.toISOString().slice(0, 10) !== specifiedDate.toISOString().slice(0, 10)) {
      console.log("Not the specified date, skipping backfill.");
      return;
    } else {
      console.log("Running backfill");
    }

    // Set access token
    const accessToken = await Helpers.SumUpAuth();
    if (!accessToken) {
      throw "Something went wrong contacting SumUp";
    }

    // Get SumUp transactions
    const records = await Helpers.sumUpGetAllTransactions(accessToken);

    // Insert SumUp transaction records into database
    await Helpers.insertSumUpTransactions(records, SumupTransactions);

    // Cron job will be stopped as the backfill should only be ran once to insert historical data
    backfillSumupTransactions.stop();
  },
  start: false,
  timeZone: "Europe/London",
});

module.exports = backfillSumupTransactions;
