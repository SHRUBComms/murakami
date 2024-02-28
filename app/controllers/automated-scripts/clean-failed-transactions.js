const CronJob = require("cron").CronJob;
const moment = require("moment");
moment.locale("en-gb");

// Import models etc.
const rootDir = process.env.CWD;
const Models = require(rootDir + "/app/models/sequelize");
const Transactions = Models.Transactions;

const Helpers = require(rootDir + "/app/controllers/helper-functions/root");

const failedTransactions = new CronJob({
  // every minute.
  cronTime: "5 * * * *",
  onTick: async () => {
    console.log(
      `\n---\n CLEAN UP FAILED CARD TRANSACTIONS ${moment().format(
        "L hh:mm A"
      )}\n---\n`
    );
    /* 
	Filter out cash transactions and card transactions that already have a SumUp ID.
	For each transaciton, find corresponding SumUp transactions within a 20-minute window of the local transaction's date.
	Ensure the SumUp transaction is successful and matches the local transaction amount.
	Check if the SumUp transaction has already been processed or matched.
	Update the local transaction record with the SumUp transaction code if a match is found.
	*/
    try {
      let remediationStartDate = moment("2019-03-26");

      const accessToken = await Helpers.SumUpAuth();
      if (!accessToken) {
        throw "Something went wrong contacting SumUp";
      }

      while (remediationStartDate.isBefore("2024-02-29")) {
        remediationStartDate = remediationStartDate.add(1, "day");
        console.log({
          remediationStartDate: remediationStartDate
            .format("L hh:mm A")
            .toString(),
        });
        let fxTransactions = {}; // SumUp transactions by ID.
        const transactionsStartDate = remediationStartDate
          .startOf("day")
          .toDate();
        const transactionsEndDate = remediationStartDate.endOf("day").toDate();

        const rawTransactions = await Transactions.getAllBetweenTwoDates(
          transactionsStartDate,
          transactionsEndDate
        );

        //Filter out cash transactions card transactions that already have a SumUp ID.
        const transactions = rawTransactions.filter(
          (t) => t.summary.paymentMethod === "card" && !t.summary.sumupId
        );

        if (transactions.length == 0) {
          continue;
        }

        const sumupTransactions =
          await Helpers.SumUpGetTransactionsBetweenTwoDates(
            transactionsStartDate,
            transactionsEndDate,
            accessToken
          );
        if (sumupTransactions.error_code) {
          continue;
        }

        for await (const transaction of transactions) {
          const startTimestamp = moment(transaction.date).subtract(
            10,
            "minutes"
          );
          const endTimestamp = moment(transaction.date).add(10, "minutes");

          for (const fxTransaction of sumupTransactions.items) {
            if (fxTransaction.status != "SUCCESSFUL") {
              continue;
            }

            if (fxTransaction.amount != transaction.summary.totals.money) {
              continue;
            }

            if (fxTransactions[fxTransaction.transaction_code]) {
              continue;
            }

            const fxInUse = rawTransactions.find(
              (t) => t.summary.sumupId === fxTransaction.transaction_code
            );

            if (fxInUse) {
              continue;
            }

            let updatedSummary = transaction.summary;
            updatedSummary.sumupId = fxTransaction.transaction_code;
            await Transactions.update(
              { summary: updatedSummary },
              { where: { transaction_id: transaction.transaction_id } }
            );
            console.log(
              "TRANSACTION FOUND",
              fxTransaction.transaction_code,
              transaction.transaction_id
            );
            fxTransactions[fxTransaction.transaction_code] = true;
          }
        }
        console.log("---.---.---.---");
        await timeout(1000);
      }
    } catch (error) {
      console.error(error);
    }
  },
  start: false,
  timeZone: "Europe/London",
});

const timeout = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = failedTransactions;
