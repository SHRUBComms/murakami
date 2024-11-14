const CronJob = require("cron").CronJob;
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;
const Models = require(rootDir + "/app/models/sequelize");
const SumupTransactions = Models.SumupTransactions;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

// Backfill date
const specifiedDate = moment("2024-11-01", "YYYY-MM-DD");

const reconcileSumupTransactions = new CronJob({
  cronTime: "0 3 * * *",
  onTick: async () => {
    // Only run the daily ingestion after the backfill
    const now = moment();
    if (now < specifiedDate) {
      console.log("Will only run after backfill has been completed");
      return;
    } else {
      console.log("Running reconciliation");
    }

    // Set access token
    const accessToken = await Helpers.SumUpAuth();
    if (!accessToken) {
      throw "Something went wrong contacting SumUp";
    }

    // Set today and yesterday dates
    const today = moment().endOf("day").toDate();
    const yesterday = moment().subtract(1, "days").endOf("day").toDate();

    // Get SumUp transactions
    const records = await Helpers.sumUpGetAllTransactionsBetweenTwoDates(
      accessToken,
      yesterday,
      today
    );

    // Insert SumUp transaction records into database
    await Helpers.insertSumUpTransactions(records, SumupTransactions);
  },
  start: false,
  timeZone: "Europe/London",
});

module.exports = reconcileSumupTransactions;
