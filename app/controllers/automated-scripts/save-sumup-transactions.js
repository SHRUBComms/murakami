const CronJob = require("cron").CronJob;
const moment = require("moment");
moment.locale("en-gb");

const rootDir = process.env.CWD;
const Models = require(rootDir + "/app/models/sequelize");
const SumupTransactions = Models.SumupTransactions;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

const saveSumupTransactions = new CronJob({
  cronTime: "0 3 * * *",
  onTick: async () => {
    console.log(`Running saveSumupTransactions ${moment().format("DD/MM/YYYY HH:mm")}`);

    // Set backfill dates
    let startDate = null;
    let latestTransactionId = null;
    const latestRecord = await SumupTransactions.findOne({
      attributes: ["timestamp", "id"],
      order: [["timestamp", "DESC"]],
    });

    if (latestRecord && latestRecord.dataValues.timestamp) {
      startDate = moment(latestRecord.dataValues.timestamp);
      latestTransactionId = latestRecord.dataValues.id;
    }
    const endDate = moment();

    // Set access token
    const accessToken = await Helpers.SumUpAuth();
    if (!accessToken) {
      throw new Error("Something went wrong contacting SumUp");
    }

    // Get all new SumUp transactions
    let records;
    if (startDate) {
      //Add a second to the start date to avoid duplicate records
      records = await Helpers.sumUpGetAllTransactionsBetweenTwoDates(
        accessToken,
        startDate.toDate(),
        endDate.toDate()
      );
    } else {
      records = await Helpers.sumUpGetAllTransactions(accessToken);
    }

    // Find the index of the latest transaction in the records array
    let cutoffIndex = -1;
    if (latestTransactionId) {
      cutoffIndex = records.findIndex((record) => record.id === latestTransactionId);
    }

    // Slice the array to only include new transactions
    const newRecords =
      cutoffIndex !== -1 ? records.slice(cutoffIndex + 1, records.length) : records;

    // Filter out pending transactions
    const transactionsToStore = newRecords.filter((record) => {
      return record.status !== "PENDING";
    });

    // Insert SumUp transaction records into database
    await Helpers.insertSumUpTransactions(transactionsToStore, SumupTransactions);
  },
  start: false,
  timeZone: "Europe/London",
});

module.exports = saveSumupTransactions;
