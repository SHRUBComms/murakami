var request = require("request");

module.exports = function(transaction_id, access_token, callback) {
  request.get(
    "https://api.sumup.com/v0.1/me/transactions?transaction_code=" +
      transaction_id,
    {
      headers: {
        authorization: "Bearer " + access_token
      }
    },
    (error, sumupResponse, body) => {
      if (!error && sumupResponse.statusCode == 200 && !body.error_code) {
        body = JSON.parse(body);
        callback(null, body);
      } else {
        callback(error, null);
      }
    }
  );
};
