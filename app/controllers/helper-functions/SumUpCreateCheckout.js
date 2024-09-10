const fetch = require("node-fetch");

module.exports = async (murakamiTransactionId, membershipCost, transactionComment, accessToken) => {
  const response = await fetch(`https://api.sumup.com/v0.1/checkouts`, {
    method: "post",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      checkout_reference: murakamiTransactionId,
      amount: membershipCost,
      currency: "GBP",
      pay_to_email: process.env.SUMUP_USERNAME,
      description: transactionComment,
      return_url: "https://shrubcoop.org/get-involved#member-signup",
    }),
  });

  if (!response.ok) {
    throw "Failed to create SumUp checkout - please contact support";
  }

  const json = await response.json();
  return json;
};
