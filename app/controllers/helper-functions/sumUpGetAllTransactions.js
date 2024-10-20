const moment = require("moment");
moment.locale("en-gb");

module.exports = async (accessToken) => {
  try {
    let allRecords = [];
    let nextUrl = `https://api.sumup.com/v0.1/me/transactions/history?limit=9999`;
    while (nextUrl) {
      const response = await fetch(nextUrl, {
        method: "GET",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      const json = await response.json();
      allRecords = allRecords.concat(json.items);

      if ("links" in json) {
        const nextLink = json.links.find((link) => link.rel === "next");
        nextUrl = `https://api.sumup.com/v0.1/me/transactions/history?${nextLink.href}`;
      } else {
        nextUrl = null;
      }
    }
    return allRecords;
  } catch (error) {
    throw "Error fetching transaction details from SumUp";
  }
};
