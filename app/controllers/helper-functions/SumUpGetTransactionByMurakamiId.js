const fetch = require("node-fetch");

module.exports = async (transaction_id, access_token) => {
  try {
    const response = await fetch (
      `https://api.sumup.com/v0.1/me/transactions?foreign_transaction_id=${transaction_id}`,
      { 
        method: "get",
        headers: {
          authorization: `Bearer ${access_token}`
        }
      }
    );

    const json = await response.json();
    return json;
  } catch (error) {
    throw "Something went wrong fetching the transaction details from SumUp";
  }
}
