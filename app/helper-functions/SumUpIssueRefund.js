var request = require("request");

module.exports = function(transaction_id, amount, access_token, callback) {
  console.log(transaction_id);
  request.post(
    "https://api.sumup.com/v0.1/me/refund/" + transaction_id,
    {
      json: {
        amount: amount
      },
      headers: {
        authorization: "Bearer " + access_token
      }
    },
    function(error, sumupResponse, body) {
      if (!error && sumupResponse.statusCode == 204) {
        callback(null);
      } else {
        callback(error);
      }
    }
  );
};
