var request = require("request");

module.exports = function(transaction_id, amount, access_token, callback) {
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
      if (!err && sumupResponse.statusCode == 204) {
        callback(null);
      } else {
        callback(err);
      }
    }
  );
};
