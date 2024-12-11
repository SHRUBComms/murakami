const fetch = require("node-fetch");

/**
 * Fetches transaction details from the SumUp API
 * @param {Object} params - The parameters object
 * @param {string} params.transaction_id - The ID of the transaction to lookup
 * @param {string} params.access_token - The SumUp API access token
 * @param {string} params.lookupField - The field to use for transaction lookup ENUM ['id', 'internal_id', 'transaction_code', 'foreign_transaction_id', 'client_transaction_id']
 * @returns {Promise<Object>} The transaction details from SumUp
 * @throws {string} If there's an error fetching the transaction
 * @throws {Error} If the API response status is not 200
 */
module.exports = async ({ transactionId, accessToken, lookupField }) => {
  try {
    const response = await fetch(
      `https://api.sumup.com/v0.1/me/transactions?${lookupField}=${transactionId}`,
      {
        method: "get",
        headers: {
          authorization: `Bearer ${accessToken}`,
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
    console.log({ errorMessage: `Error fetching single transaction from sumup: ${error}` });
    throw "Something went wrong fetching the transaction details from SumUp";
  }
};
