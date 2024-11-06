const fetch = require("node-fetch");
const moment = require("moment");
moment.locale("en-gb");

module.exports = async (startDate, endDate, access_token) => {
  try {
    const response = await fetch(
      `https://api.sumup.com/v0.1/me/transactions/history?limit=9999&newest_time=${moment(endDate).toISOString()}&oldest_time=${moment(startDate).toISOString()}`,
      {
        method: "get",
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }
    );

    const json = await response.json();

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch transaction details: ${response.status} ${response.statusText}`
      );
    }
    return json;
  } catch (error) {
    console.log({
      errorMessage: `Error fetching SumUpTransactionBetweenTwoDates from sumup: ${error}`,
    });
    throw "Something went wrong fetching the transaction details from SumUp";
  }
};
