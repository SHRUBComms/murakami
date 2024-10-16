const fetch = require("node-fetch");

module.exports = async (transaction_id, amount, accessToken) => {
  const response = await fetch(`https://api.sumup.com/v0.1/me/refund/${transaction_id}`, {
    method: "post",
    body: JSON.stringify({ amount: amount }),
    headers: {
      authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  console.log("SUMUP ISSUE REFUND RESPONSE", new Date(), response);

  if (response.status !== 204) {
    throw "SumUp failed to issue the refund - please contact support";
  }

  return true;
};
